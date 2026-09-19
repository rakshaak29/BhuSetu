import { EvidenceEvent, VerificationStatus } from '../types/domain';

export interface LedgerBlock {
  blockNumber: number;
  previousBlockHash: string;
  blockHash: string;
  txId: string;
  timestamp: string;
  channelId: string; // "land-records-pilot"
  endorsingOrgs: string[]; // e.g. ["RevenueOrg", "RegistrationOrg"]
  eventData: {
    eventId: string;
    parcelId: string;
    eventType: string;
    evidenceType: string;
    sha256: string;
    sourceSystem: string;
    sourceReference: string;
    previousEventId?: string;
    makerActorId: string;
    checkerActorId: string;
    approvalReason?: string;
    verificationReference: string;
  };
}

class FabricLedgerEngine {
  private blocks: LedgerBlock[] = [];
  private channelId = 'land-records-pilot';

  constructor() {
    // Genesis block creation
    this.createBlock('0000000000000000000000000000000000000000000000000000000000000000', 'tx-genesis', ['SystemOrg'], {
      eventId: 'evt-genesis',
      parcelId: 'PCL-GENESIS',
      eventType: 'ISSUE',
      evidenceType: 'ROR_EXTRACT',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      sourceSystem: 'BhuSetu Genesis',
      sourceReference: 'GENESIS-001',
      makerActorId: 'system',
      checkerActorId: 'system',
      verificationReference: 'BHS-0000-0000'
    });
  }

  private createBlock(
    previousHash: string,
    txId: string,
    endorsingOrgs: string[],
    eventData: LedgerBlock['eventData']
  ): LedgerBlock {
    const blockNumber = this.blocks.length;
    const timestamp = new Date().toISOString();

    // Simple deterministic string hashing for block hash simulation
    const rawBlockStr = `${blockNumber}:${previousHash}:${txId}:${timestamp}:${JSON.stringify(eventData)}`;
    let hashVal = 0;
    for (let i = 0; i < rawBlockStr.length; i++) {
      hashVal = (hashVal << 5) - hashVal + rawBlockStr.charCodeAt(i);
      hashVal |= 0;
    }
    const blockHash = 'blk-' + Math.abs(hashVal).toString(16).padStart(16, '0');

    const block: LedgerBlock = {
      blockNumber,
      previousBlockHash: previousHash,
      blockHash,
      txId,
      timestamp,
      channelId: this.channelId,
      endorsingOrgs,
      eventData
    };

    this.blocks.push(block);
    return block;
  }

  /**
   * Commits an approved evidence event to the Hyperledger Fabric ledger
   */
  public commitEvent(
    event: EvidenceEvent,
    endorsingOrgs: string[] = ['RevenueOrg', 'RegistrationOrg']
  ): { txId: string; blockNumber: number; blockHash: string } {
    // Invariant Check 1: Maker and Checker MUST be distinct
    if (event.makerActorId === event.checkerActorId) {
      throw new Error("Ledger Endorsement Error: Maker and Checker actor IDs must be distinct.");
    }

    // Invariant Check 2: Event MUST be approved
    if (event.status !== 'APPROVED') {
      throw new Error(`Ledger Rejection: Event ${event.eventId} is not in APPROVED status.`);
    }

    const previousBlock = this.blocks[this.blocks.length - 1];
    const txId = `tx-fb-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;

    const block = this.createBlock(
      previousBlock.blockHash,
      txId,
      endorsingOrgs,
      {
        eventId: event.eventId,
        parcelId: event.parcelId,
        eventType: event.eventType,
        evidenceType: event.evidenceType,
        sha256: event.sha256,
        sourceSystem: event.sourceSystem,
        sourceReference: event.sourceReference,
        previousEventId: event.previousEventId,
        makerActorId: event.makerActorId,
        checkerActorId: event.checkerActorId || 'unassigned',
        approvalReason: event.approvalReason,
        verificationReference: event.verificationReference
      }
    );

    return {
      txId: block.txId,
      blockNumber: block.blockNumber,
      blockHash: block.blockHash
    };
  }

  public getHistoryForParcel(parcelId: string): LedgerBlock[] {
    return this.blocks.filter(b => b.eventData.parcelId === parcelId);
  }

  public getBlockByTxId(txId: string): LedgerBlock | undefined {
    return this.blocks.find(b => b.txId === txId);
  }

  public getAllBlocks(): LedgerBlock[] {
    return [...this.blocks];
  }
}

export const fabricLedgerEngine = new FabricLedgerEngine();
