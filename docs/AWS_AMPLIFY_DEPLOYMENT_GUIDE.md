# AWS Amplify Hosting Deployment Guide: BhuSetu (भू-सेतु)

This guide provides step-by-step instructions for deploying the **BhuSetu** full-stack Next.js 15 application to **AWS Amplify Hosting**, connecting directly to your GitHub repository [`rakshaak29/BhuSetu`](https://github.com/rakshaak29/BhuSetu) on branch `main`.

---

## 1. Prerequisites & Existing AWS Resources

BhuSetu uses provisioned AWS infrastructure in **AWS Asia Pacific (Mumbai) / `ap-south-1`**:

| Resource | Value / Identifier | Notes |
| :--- | :--- | :--- |
| **AWS Region** | `ap-south-1` (Mumbai) | Selected project Region |
| **AWS Account ID** | `459532536558` | Dev project |
| **GitHub Repository** | `https://github.com/rakshaak29/BhuSetu` | Branch: `main` |
| **S3 Evidence Bucket** | `bhusetu-evidence-459532536558-apsouth1` | Encrypted AES256, Public Access Blocked |
| **DynamoDB Parcels** | `bhusetu-parcels` | Partition key: `parcelId` |
| **DynamoDB Evidence** | `bhusetu-evidence` | Partition key: `eventId`, GSI on `verificationReference` |
| **DynamoDB Audit** | `bhusetu-audit` | Partition key: `auditEventId` |

---

## 2. Step-by-Step Deployment via AWS Amplify Console

### Step 2.1: Open AWS Amplify Console
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. In the top-right navigation bar, ensure the Region is set to **Asia Pacific (Mumbai) `ap-south-1`**.
3. In the search bar, search for **Amplify** and navigate to the AWS Amplify service.

### Step 2.2: Create a New App
1. On the AWS Amplify home page, click **Deploy an app** (or **New app** > **Host web app**).
2. Select **GitHub** as the source repository provider and click **Next**.
3. If prompted, authorize AWS Amplify to access your GitHub account.

### Step 2.3: Select Repository & Branch
1. Under **Recently updated repositories**, select:
   - **Repository:** `rakshaak29/BhuSetu`
   - **Branch:** `main`
2. Leave the root directory blank (root of repository).
3. Click **Next**.

### Step 2.4: Build Settings & Environment Variables
Amplify will automatically detect `amplify.yml` in the root of the repository.

1. **Service Role:**
   - If you do not have an existing Amplify service role, choose **Create new role**.
   - Ensure the role grants read/write permissions to DynamoDB (`bhusetu-*`) and S3 (`bhusetu-evidence-*`). *(See Section 3 for the IAM policy template).*
2. **Environment Variables:**
   Expand **Advanced settings** (or go to **App settings > Environment variables** after creation) and add the following key-value pairs:

   | Variable Name | Value | Description |
   | :--- | :--- | :--- |
   | `AWS_REGION` | `ap-south-1` | AWS Region for DynamoDB & S3 SDK clients |
   | `NEXT_PUBLIC_AWS_REGION` | `ap-south-1` | Public Region identifier for frontend badges |
   | `PARCEL_TABLE` | `bhusetu-parcels` | DynamoDB Parcels table name |
   | `EVIDENCE_TABLE` | `bhusetu-evidence` | DynamoDB Evidence events table name |
   | `AUDIT_TABLE` | `bhusetu-audit` | DynamoDB Audit logs table name |
   | `EVIDENCE_BUCKET` | `bhusetu-evidence-459532536558-apsouth1` | Amazon S3 Evidence storage bucket |
   | `AWS_BUDGET_LIMIT_USD` | `100` | Pilot budget threshold |

3. Click **Next**.

### Step 2.5: Review & Deploy
1. Review the application configuration:
   - **Framework:** Next.js - SSR
   - **Platform:** `WEB_COMPUTE`
   - **Build Specification:** `amplify.yml` detected in repository
2. Click **Save and deploy**.

Amplify will automatically run through the four build phases:
1. **Provision:** Allocates the managed compute environment.
2. **Build:** Runs `npm ci` and `npm run build`.
3. **Deploy:** Deploys static assets to global CloudFront CDN and server-side routes (`/api/v1/*`) to managed compute.
4. **Verify:** Tests endpoint health and issues an SSL-secured live URL:  
   `https://main.<unique-app-id>.amplifyapp.com`

---

## 3. IAM Permissions for Amplify Service Role

To ensure the serverless API routes on Amplify can interact with DynamoDB and S3, attach an IAM policy to the Amplify service execution role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:DescribeTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:459532536558:table/bhusetu-parcels",
        "arn:aws:dynamodb:ap-south-1:459532536558:table/bhusetu-parcels/*",
        "arn:aws:dynamodb:ap-south-1:459532536558:table/bhusetu-evidence",
        "arn:aws:dynamodb:ap-south-1:459532536558:table/bhusetu-evidence/*",
        "arn:aws:dynamodb:ap-south-1:459532536558:table/bhusetu-audit",
        "arn:aws:dynamodb:ap-south-1:459532536558:table/bhusetu-audit/*"
      ]
    },
    {
      "Sid": "S3EvidenceBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bhusetu-evidence-459532536558-apsouth1",
        "arn:aws:s3:::bhusetu-evidence-459532536558-apsouth1/*"
      ]
    }
  ]
}
```

---

## 4. Continuous Deployment Workflow

With Amplify Hosting connected to GitHub:
- **Every push to `main`** triggers an automatic build and zero-downtime deployment.
- **Pull Requests (Preview Branches):** Amplify can automatically create temporary preview URLs for each pull request to review changes before merging into production.

---

## 5. Post-Deployment Verification Checklist

Once the build completes:
1. Open the generated `https://main.<app-id>.amplifyapp.com` link.
2. Verify the homepage loads with the ambient video and sovereign theme.
3. Test **Citizen Verification (`/verify`)**:
   - Enter reference `BHS-2M7D-9KQX` and verify the instant **VERIFIED** badge.
   - Enter reference `BHS-88X9-4K2M` and verify the **DISPUTED (COURT INJUNCTION)** warning.
4. Test **Officer Portal (`/officer`)**:
   - Verify that the pending approval queue, parcel timeline, and dispute hold controls load properly.
5. Test **Audit Export (`/officer/audit`)**:
   - Check that audit logs display and click **Export Audit Log (JSON)** to verify courtroom-admissible electronic evidence logging.
