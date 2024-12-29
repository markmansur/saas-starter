import { Stack, StackProps } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import { StaticWebsite } from "../../constructs/static-website.cr.js";
import { Source } from "aws-cdk-lib/aws-s3-deployment";
import path from "path";

export class FrontendStack extends Stack {
  constructor(scope: IConstruct, id: string, props?: StackProps) {
    super(scope, id, props);

    new StaticWebsite(this, "staticWebsite", {
      sources: [Source.asset(path.relative(".", "../web/dist"))],
    });
  }
}
