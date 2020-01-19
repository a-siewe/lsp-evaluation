import * as path from "path";
import { ExtensionContext } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient";

let client: LanguageClient;
export function activate(context: ExtensionContext) {
  let relativePath = path.join("node_modules", "javascript-typescript-langserver", "lib", "language-server-stdio.js");
  let serverModule = context.asAbsolutePath(relativePath);
  let serverOptions: ServerOptions = {
    run: { command: serverModule, args: ["-t", "-l", "./LOGFILE.log"] },
    debug: {
      command: "node",
      args: ["--nolazy", "--inspect=6009", serverModule, "-t", "-l", "./LOGFILE.log"]
    }
  };
  let clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "typescript" }
    ]
  };
  client = new LanguageClient(
    "JSLangServer",
    "LangServer for JS",
    serverOptions,
    clientOptions
  );
  client.start();
}
export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
