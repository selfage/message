#!/usr/bin/env node
import fs = require("fs");
import path = require("path");
import { deserializeMessage, serializeMessage } from "./serializer";
import { Command } from "commander";

function toUnixPath(originalPath: string): string {
  return originalPath.split(path.sep).join(path.posix.sep);
}

function getImportFilePath(file: string): string {
  return `./${path.posix.relative(toUnixPath(__dirname), path.posix.join(toUnixPath(process.cwd()), toUnixPath(file)))}`;
}

async function serialize(
  jsonString: string,
  encoding: "hex" | "base64",
  file: string,
  name: string,
): Promise<void> {
  let message = JSON.parse(jsonString);
  let importedFile = await import(getImportFilePath(file));
  let binary = serializeMessage(message, importedFile[name]);
  console.log(Buffer.from(binary).toString(encoding));
}

async function deserialize(
  encodedString: string,
  encoding: "hex" | "base64",
  file: string,
  name: string,
): Promise<void> {
  let binary = Buffer.from(encodedString, encoding);
  let importedFile = await import(getImportFilePath(file));
  console.log(JSON.stringify(deserializeMessage(binary, importedFile[name])));
}

async function main(): Promise<void> {
  let packageConfig = JSON.parse(
    (
      await fs.promises.readFile(path.join(__dirname, "package.json"))
    ).toString(),
  );
  let program = new Command();
  program.version(packageConfig.version);
  program
    .command("serialize <string>")
    .alias("srl")
    .description(
      `Serialize a message represented as a JSON string into bytes encoded as a hexadecimal/base64-encoded string.`,
    )
    .requiredOption(
      "-e, --encoding <encoding>",
      `Specify the output encoding. Usually "hex" or "base64". But any encoding Nodejs Buffer supports will do.`,
    )
    .requiredOption(
      "-d, --descriptor-file <file>",
      `The JS/TS file that contains the target message's descriptor, excluding .js/.ts suffix.`,
    )
    .requiredOption(
      "-n, --descriptor-name <name>",
      `The variable name in the descriptor file.`,
    )
    .action((jsonString, options) =>
      serialize(
        jsonString,
        options.encoding,
        options.descriptorFile,
        options.descriptorName,
      ),
    );
  program
    .command("deserialize <string>")
    .alias("dsl")
    .description(
      `Deserialize bytes encoded as a hexadecimal/base64-encoded string into a message represented as a JSON string.`,
    )
    .requiredOption(
      "-e, --encoding <encoding>",
      `Specify the input encoding. Usually "hex" or "base64". But any encoding Nodejs Buffer supports will do.`,
    )
    .requiredOption(
      "-d, --descriptor-file <file>",
      `The JS/TS file that contains the target message's descriptor, excluding .js/.ts suffix.`,
    )
    .requiredOption(
      "-n, --descriptor-name <name>",
      `The variable name in the descriptor file.`,
    )
    .action((encodedString, options) =>
      deserialize(
        encodedString,
        options.encoding,
        options.descriptorFile,
        options.descriptorName,
      ),
    );
  await program.parseAsync();
}

main();
