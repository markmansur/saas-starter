#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/stacks/frontend/frontend.stack.js";

const app = new cdk.App();

new FrontendStack(app, "frontendStack");
