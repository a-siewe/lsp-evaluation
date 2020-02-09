#!/usr/bin/env node
import * as yargs from "yargs";
import { ClientOptions } from "./types";
import Client from "./client";
import * as path from "path";
import Debug from "debug";

let debug = Debug("lsp-benchmarker:index");

const args = (yargs.alias("r", "rootDir").alias("o", "outDir")
  .argv as any) as ClientOptions;

if (!args.rootDir) {
  args.rootDir = process.cwd();
}

if (!args.outDir) {
  args.outDir = path.join(
    "/home/asiewe/MEGA/HDA/SS19/Abschluss/Workspace/lsp-benchmark/measurements"
  );
}

let client = new Client(args, ".js");
client.run();
