/**
 * BhuSetu: Create DynamoDB GSI for parcelId queries
 *
 * Adds 'parcelId-createdAt-index' to 'bhusetu-evidence' table.
 * Partition Key: parcelId (S)
 * Sort Key: createdAt (S)
 * Projection: ALL
 *
 * Usage: npx tsx scripts/create-gsi.ts
 */

import { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.EVIDENCE_TABLE || 'bhusetu-evidence';
const INDEX_NAME = 'parcelId-createdAt-index';

const client = new DynamoDBClient({ region: REGION });

async function main() {
  console.log(`Checking table "${TABLE_NAME}" in ${REGION}...`);

  try {
    const desc = await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    const existingGsis = desc.Table?.GlobalSecondaryIndexes || [];
    const found = existingGsis.find(g => g.IndexName === INDEX_NAME);

    if (found) {
      console.log(`✓ GSI "${INDEX_NAME}" already exists on table "${TABLE_NAME}" (status: ${found.IndexStatus}).`);
      return;
    }

    console.log(`Adding GSI "${INDEX_NAME}" to table "${TABLE_NAME}"...`);

    const res = await client.send(new UpdateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: 'parcelId', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: INDEX_NAME,
            KeySchema: [
              { AttributeName: 'parcelId', KeyType: 'HASH' },
              { AttributeName: 'createdAt', KeyType: 'RANGE' },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        },
      ],
    }));

    console.log(`✓ GSI creation initiated successfully! Table status: ${res.TableDescription?.TableStatus}`);
  } catch (err: any) {
    if (err.name === 'ResourceInUseException') {
      console.log(`Notice: Table or index is currently being updated.`);
    } else {
      console.error(`Failed to create GSI:`, err.message || err);
      console.log(`\nAWS CLI fallback command:\naws dynamodb update-table --table-name ${TABLE_NAME} --attribute-definitions AttributeName=parcelId,AttributeType=S AttributeName=createdAt,AttributeType=S --global-secondary-index-updates '[{"Create":{"IndexName":"${INDEX_NAME}","KeySchema":[{"AttributeName":"parcelId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}}]' --region ${REGION}`);
    }
  }
}

main().catch(console.error);
