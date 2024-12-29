import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { BucketDeployment, ISource } from "aws-cdk-lib/aws-s3-deployment";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import {
  HostedZone,
  RecordTarget,
  AaaaRecord,
  ARecord,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

export interface StaticWebsiteProps {
  sources: ISource[];
  defaultRootObject?: string;
  hostedZone?: HostedZone;
  domainName?: string;
  certificate?: Certificate;
  reactRouter?: boolean;
}

export class StaticWebsite extends Construct {
  public readonly distribution: Distribution;
  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);

    const bucket = new Bucket(this, "FrontendBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "originAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    this.distribution = new Distribution(this, "CloudFrontDistribution", {
      defaultRootObject: props.defaultRootObject || "index.html",
      errorResponses: props.reactRouter
        ? [
            // We need this for react router to work properly.
            {
              httpStatus: 404,
              responsePagePath: "/",
              responseHttpStatus: 200,
            },
          ]
        : [],
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket, {
          originAccessControlId: originAccessIdentity.originAccessIdentityId,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: props.domainName
        ? [props.domainName, `www.${props.domainName}`]
        : undefined,
      certificate: props.certificate,
    });

    new BucketDeployment(this, "BucketDeployment", {
      destinationBucket: bucket,
      sources: props.sources,
      logRetention: RetentionDays.ONE_MONTH,
    });

    if (props.hostedZone) {
      new ARecord(this, "ARecord", {
        zone: props.hostedZone,
        recordName: props.domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      });

      new AaaaRecord(this, "AAAARecord", {
        zone: props.hostedZone,
        recordName: props.domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      });
    }

    new CfnOutput(this, "DistributionUrl", {
      value: this.distribution.distributionDomainName,
    });
  }
}
