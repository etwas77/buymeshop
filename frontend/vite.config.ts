import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import ts from "typescript";

const terminalColors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
};

const clearTerminalScreen = "\x1b[2J\x1b[3J\x1b[H";

function formatTerminalMessage(color: string, label: string, message: string): string {
  return `${color}${label}${terminalColors.reset} ${message}`;
}

type DiagnosticsState = {
  warnings: string[];
  error?: string;
};

function collectTypeScriptUnusedWarnings(): DiagnosticsState {
  try {
    const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json");
    if (!configPath) {
      return { warnings: [] };
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    if (configFile.error) {
      return { warnings: [] };
    }

    const parsed = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath),
      {
        noEmit: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
      },
      configPath
    );

    const program = ts.createProgram({
      rootNames: parsed.fileNames,
      options: parsed.options,
    });

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter(diagnostic => diagnostic.code === 6133 || diagnostic.code === 6192);

    return {
      warnings: diagnostics.map(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      if (diagnostic.file && typeof diagnostic.start === "number") {
        const pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const relativePath = path.relative(process.cwd(), diagnostic.file.fileName).replace(/\\/g, "/");
        return `${relativePath}:${pos.line + 1}:${pos.character + 1} TS${diagnostic.code}: ${message}`;
      }

      return `TS${diagnostic.code}: ${message}`;
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown diagnostics failure.";
    return { warnings: [], error: message };
  }
}

function tsWarningPlugin() {
  let lastSnapshot = "__initial__";
  let reportTimer: NodeJS.Timeout | undefined;
  let hadPrintedDiagnostics = false;

  const isRelevantPath = (file: string): boolean => {
    const normalized = file.replace(/\\/g, "/");
    return normalized.endsWith(".ts") || normalized.endsWith(".tsx") || normalized.endsWith("/tsconfig.json");
  };

  const reportWarnings = (): void => {
    const diagnosticsState = collectTypeScriptUnusedWarnings();
    const snapshot = JSON.stringify(diagnosticsState);

    if (snapshot === lastSnapshot) {
      return;
    }

    lastSnapshot = snapshot;

    if (diagnosticsState.error) {
      process.stdout.write(clearTerminalScreen);
      console.error(formatTerminalMessage(terminalColors.red, "[ts error]", diagnosticsState.error));
      hadPrintedDiagnostics = true;
      return;
    }

    if (diagnosticsState.warnings.length === 0) {
      if (hadPrintedDiagnostics) {
        process.stdout.write(clearTerminalScreen);
      }

      hadPrintedDiagnostics = false;
      return;
    }

    process.stdout.write(clearTerminalScreen);
    diagnosticsState.warnings.forEach(warning => {
      console.warn(formatTerminalMessage(terminalColors.yellow, "[ts warning]", warning));
    });
    hadPrintedDiagnostics = true;
  };

  const scheduleReport = (): void => {
    if (reportTimer) {
      clearTimeout(reportTimer);
    }

    reportTimer = setTimeout(reportWarnings, 120);
  };

  return {
    name: "ts-warning-plugin",
    configureServer(server: { watcher: { on: (event: string, cb: (file: string) => void) => void } }) {
      scheduleReport();

      server.watcher.on("change", (file: string) => {
        if (isRelevantPath(file)) {
          scheduleReport();
        }
      });
    },
    handleHotUpdate(ctx: { file: string }) {
      if (isRelevantPath(ctx.file)) {
        scheduleReport();
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tsWarningPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) {
            return "react";
          }

          if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
            return "redux";
          }

          if (
            id.includes("react-bootstrap") ||
            id.includes("react-icons") ||
            id.includes("react-slick") ||
            id.includes("slick-carousel")
          ) {
            return "ui";
          }

          if (
            id.includes("axios") ||
            id.includes("lodash") ||
            id.includes("react-toastify") ||
            id.includes("react-medium-image-zoom")
          ) {
            return "utils";
          }
        },
      },
    },
  },
});
