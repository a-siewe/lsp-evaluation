import { spawn } from "child_process";
import * as rpc from "vscode-jsonrpc";
import * as path from "path";
import * as fs from "fs";
import Debug from "debug";
import { NotificationType, RequestType } from "vscode-jsonrpc";
import {
  InitializeResult,
  PublishDiagnosticsNotification
} from "vscode-languageserver-protocol";
import { MessageConnection } from "vscode-jsonrpc";
import { ClientOptions, Measurement } from "./types";
import { getFiles, writeFile } from "./helpers";
import * as sloc from "sloc";
import * as ts from "typescript";
import * as chalk from "chalk";

let debug = Debug("lsp-benchmarker");
export default class Client {
  connection: MessageConnection;
  clientOptions: ClientOptions;
  files: string[];
  extension: string;
  diagnostics: Map<String, Measurement>;

  constructor(clientOptions: ClientOptions, extension: string) {
    this.clientOptions = clientOptions;
    this.extension = extension;
    debug("Client options", clientOptions);
    this.files = getFiles(clientOptions.rootDir, this.extension);
    debug(this.files.length, "files found");
    this.diagnostics = new Map();

    const serverCommand = path.resolve(
      "./node_modules/javascript-typescript-langserver/lib/language-server-stdio.js"
    );
    const serverCommandArgs = ["-t", "-l", "./LOGFILE.log"]; // "-l", "./LOGFILE.log"
    const server = spawn(serverCommand, serverCommandArgs);
    this.connection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(server.stdout),
      new rpc.StreamMessageWriter(server.stdin)
    );
    this.connection.listen();

    this.connection.onNotification(
      PublishDiagnosticsNotification.type,
      diagnostic => {
        let file = diagnostic.uri.replace("file://", "");
        let _diagnostic = this.diagnostics.get(file);
        let endTime = Date.now();
        _diagnostic.executionDuration.endTime = endTime;
        _diagnostic.duration =
          endTime - _diagnostic.executionDuration.startTime;
        this.diagnostics.set(file, _diagnostic);

        if (
          this.diagnostics.size === this.files.length &&
          Array.from(this.diagnostics)[this.diagnostics.size - 1][1].duration
        ) {
          debug(">>> TERMINATED <<<<");
          let filePath = path.join(
            this.clientOptions.outDir,
            `diagnostic.json`
          );
          debug(chalk.bold.green("WRITE RESULT..."));
          let measurments = Array.from(this.diagnostics.values());
          fs.writeFileSync(filePath, JSON.stringify(measurments));
        }
      }
    );
  }

  initialize() {
    let params = {
      processId: process.pid,
      rootPath: this.clientOptions.rootDir,
      rootUri: `file://${this.clientOptions.rootDir}`,
      capabilities: {
        workspace: {
          applyEdit: true,
          workspaceEdit: {
            documentChanges: true,
            resourceOperations: ["create", "rename", "delete"],
            failureHandling: "textOnlyTransactional"
          },
          didChangeConfiguration: { dynamicRegistration: true },
          didChangeWatchedFiles: { dynamicRegistration: true },
          symbol: {
            dynamicRegistration: true,
            symbolKind: {
              valueSet: [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26
              ]
            }
          },
          executeCommand: { dynamicRegistration: true },
          configuration: true,
          workspaceFolders: true
        },
        textDocument: {
          publishDiagnostics: { relatedInformation: true },
          synchronization: {
            dynamicRegistration: true,
            willSave: true,
            willSaveWaitUntil: true,
            didSave: true
          },
          completion: {
            dynamicRegistration: true,
            contextSupport: true,
            completionItem: {
              snippetSupport: true,
              commitCharactersSupport: true,
              documentationFormat: ["markdown", "plaintext"],
              deprecatedSupport: true,
              preselectSupport: true
            },
            completionItemKind: {
              valueSet: [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25
              ]
            }
          },
          hover: {
            dynamicRegistration: true,
            contentFormat: ["markdown", "plaintext"]
          },
          signatureHelp: {
            dynamicRegistration: true,
            signatureInformation: {
              documentationFormat: ["markdown", "plaintext"],
              parameterInformation: { labelOffsetSupport: true }
            }
          },
          definition: { dynamicRegistration: true, linkSupport: true },
          references: { dynamicRegistration: true },
          documentHighlight: { dynamicRegistration: true },
          documentSymbol: {
            dynamicRegistration: true,
            symbolKind: {
              valueSet: [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26
              ]
            },
            hierarchicalDocumentSymbolSupport: true
          },
          codeAction: {
            dynamicRegistration: true,
            codeActionLiteralSupport: {
              codeActionKind: {
                valueSet: [
                  "",
                  "quickfix",
                  "refactor",
                  "refactor.extract",
                  "refactor.inline",
                  "refactor.rewrite",
                  "source",
                  "source.organizeImports"
                ]
              }
            }
          },
          codeLens: { dynamicRegistration: true },
          formatting: { dynamicRegistration: true },
          rangeFormatting: { dynamicRegistration: true },
          onTypeFormatting: { dynamicRegistration: true },
          rename: { dynamicRegistration: true, prepareSupport: true },
          documentLink: { dynamicRegistration: true },
          typeDefinition: { dynamicRegistration: true, linkSupport: true },
          implementation: { dynamicRegistration: true, linkSupport: true },
          colorProvider: { dynamicRegistration: true },
          foldingRange: {
            dynamicRegistration: true,
            rangeLimit: 5000,
            lineFoldingOnly: true
          },
          declaration: { dynamicRegistration: true, linkSupport: true }
        }
      },
      trace: "off",
      workspaceFolders: [
        {
          uri: `file://${this.clientOptions.rootDir}`,
          name: "javascript-project"
        }
      ]
    };
    return this.connection.sendRequest(new RequestType("initialize"), params);
  }

  initialized() {
    return this.connection.sendNotification(
      new NotificationType("initialized"),
      {}
    );
  }

  didOpen() {
    let requests = this.files.map((file: string) => {
      let fileContent = fs.readFileSync(file).toString();
      return {
        file: file,
        fileContent: fileContent,
        resolveRequest: () => this.createOpenRequest(file, fileContent)
      };
    });

    for (let i = 0; i < requests.length; i++) {
      setTimeout(async () => {
        this.diagnostics.set(requests[i].file, {
          file: requests[i].file,
          fileStat: sloc(
            requests[i].fileContent,
            this.extension.replace(".", "")
          ),
          executionDuration: {
            startTime: Date.now()
          }
        });
        requests[i].resolveRequest();
      }, 4000 * (i + 1));
    }
  }

  createOpenRequest(file: string, fileContent: string) {
    let params: any = {
      textDocument: {
        uri: `file://${file}`,
        languageId: "javascript",
        version: 1,
        text: fileContent
      }
    };

    debug("Send Open Notification for", file);
    return this.connection.sendNotification(
      new NotificationType("textDocument/didOpen"),
      params
    );
  }

  completion() {
    debug("processing completion");
    this.doRequest("completion");
  }

  hover() {
    debug("processing hover");
    this.doRequest("hover");
  }

  definition() {
    debug("processing go to definition");
    this.doRequest("definition");
  }

  createRequest(file: string, fileContent: string, requestType: string) {
    let _sourceFile: ts.SourceFile = ts.createSourceFile(
      file,
      fileContent,
      ts.ScriptTarget.ES2015,
      true
    );
    let propertyAccessExpressions = [];
    this.getNodesfromType(
      _sourceFile,
      [ts.isPropertyAccessExpression],
      propertyAccessExpressions
    );
    return propertyAccessExpressions.map(
      (expression: ts.PropertyAccessExpression) => {
        let expressionIdentifier: any = expression.getChildAt(
          expression.getChildCount() - 1
        );
        let position = _sourceFile.getLineAndCharacterOfPosition(
          expressionIdentifier.getStart()
        );
        let expressionText = expression.getText();
        let call = expressionText
          .split(".")
          .slice(0, expressionText.length - 1)
          .join(".")
          .concat(".");
        let params: any = {
          textDocument: {
            uri: `file://${file}`
          },
          position: {
            line: position.line,
            character: Math.round(
              position.character + expressionIdentifier.getWidth() / 2
            )
          }
        };

        if (requestType === "completion") {
          params.context = { triggerKind: 2, triggerCharacter: "." };
        }
        return () =>
          this.resolveRequest(params, call, path.basename(file), requestType);
      }
    );
  }

  resolveRequest(params, call: string, file: string, requestType) {
    debug(
      chalk.blue.bold.underline(file),
      ":",
      chalk.blue.bold.underline(call),
      "---> "
    );
    let measurement: any = {
      startTime: Date.now(),
      call: call,
      file: path.basename(file)
    };
    return this.connection
      .sendRequest(new RequestType(`textDocument/${requestType}`), params)
      .then((res: any) => {
        if (requestType === "completion") {
          measurement.completionItemsCount = res.items.length;
          measurement.isComplete = res.isIncomplete;
        } else if (requestType === "hover") {
          measurement.Response = JSON.stringify(res.contents);
        } else if (requestType === "definition") {
          measurement.response = JSON.stringify(res);
          measurement.definedInSameFile =
            res.length === 0
              ? true
              : path.basename(file) === path.basename(res[0].uri);
        }

        measurement.endTime = Date.now();
        measurement.duration = Math.round(
          measurement.endTime - measurement.startTime
        );
        debug(
          chalk.blue.bold.underline(file),
          ":",
          chalk.blue.bold.underline(call),
          "<--- "
        );
        return measurement;
      });
  }

  async doRequest(requestType) {
    let results = [];
    let _items: any[] = this.files.map((file: string) => {
      let fileContent = fs.readFileSync(file).toString();
      return {
        filename: path.basename(file),
        ops: () => this.createRequest(file, fileContent, requestType)
      };
    });

    for (let i = 0; i < _items.length; i++) {
      let filename = _items[i].filename;
      let _tmp = _items[i].ops();
      for (let j = 0; j < _tmp.length; j++) {
        if (j === 0) {
          debug(
            ">>>>>>>>>>>>>",
            chalk.bgGreen.black.bold(filename),
            "<<<<<<<<<<<<<<"
          );
        }
        results.push(await _tmp[j]());
      }
    }

    debug("TERMINATED !!");

    let filePath = path.join(this.clientOptions.outDir, `${requestType}.json`);
    debug(chalk.bold.green("WRITE RESULT..."));
    fs.writeFileSync(filePath, JSON.stringify(results));
  }

  getNodesfromType(node: ts.Node, predicates: any[], result) {
    if (
      predicates.some(predicate => {
        return predicate(node);
      })
    ) {
      result.push(node);
    }
    ts.forEachChild(node, child => {
      this.getNodesfromType(child, predicates, result);
    });
  }

  async documentSymbol() {
    let _items: any[] = this.files.map((file: string) => {
      let params = {
        textDocument: {
          uri: `file://${file}`
        }
      };
      return {
        file: file,
        op: () =>
          this.connection.sendRequest(
            new RequestType("textDocument/documentSymbol"),
            params
          )
      };
    });

    _items.push(_items[0]);

    let results = [];
    for (let i = 0; i < _items.length; i++) {
      let fileContent = fs.readFileSync(_items[i].file).toString();
      debug(">>> call documentSymbol for", _items[i].file);
      let measurement: Measurement = {
        file: _items[i].file,
        fileStat: sloc(fileContent, this.extension.replace(".", "")),
        executionDuration: {
          startTime: Date.now()
        }
      };

      await _items[i].op();
      debug(" documentSymbol for", _items[i].file, "<<<");
      let endTime = Date.now();
      measurement.executionDuration.endTime = endTime;
      measurement.duration = endTime - measurement.executionDuration.startTime;
      results.push(measurement);
    }

    let filePath = path.join(this.clientOptions.outDir, `documentSymbol.json`);
    debug(chalk.bold.green("WRITE RESULT..."));
    fs.writeFileSync(filePath, JSON.stringify(results));
  }

  run() {
    return this.initialize()
      .then((initializeResult: InitializeResult) => {
        return this.initialized();
      })
      .then(() => {
        this.hover();
        //this.definition();
        //this.completion();
        //this.didOpen();
        //this.documentSymbol();
      });
  }
}
