import { ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from "vscode-languageclient";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  let conf = {
    command: "java",
    args: [
      "-Declipse.application=org.eclipse.jdt.ls.core.id1",
      "-Dosgi.bundles.defaultStartLevel=4",
      "-Declipse.product=org.eclipse.jdt.ls.core.product",
      "-Dlog.level=ALL",
      "-noverify",
      "-Dfile.encoding=UTF-8",
      "-Xmx1G",
      "-jar",
      "/home/asiewe/MEGA/HDA/SS19/Abschluss/resources/code/servers/jdt-language-server/plugins/org.eclipse.equinox.launcher_1.5.600.v20191014-2022.jar",
      "-configuration",
      "/home/asiewe/MEGA/HDA/SS19/Abschluss/resources/code/servers/jdt-language-server/config_linux",
    ]
  };

  let serverOptions: ServerOptions = {
    run: conf,
    debug: conf
  };


  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "java" }],
  };

  client = new LanguageClient(
    "lsp_client_java",
    "Language Client for Java",
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
