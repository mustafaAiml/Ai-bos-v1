import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface PythonResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function runPythonAgent(action: string, inputData: any = {}): Promise<any> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'python_engine', 'agent.py');
    if (!fs.existsSync(scriptPath)) {
      resolve(null);
      return;
    }

    const child = execFile('python3', [scriptPath, action], {
      timeout: 10000,
      env: { ...process.env }
    }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        resolve(null);
      }
    });

    if (child.stdin) {
      child.stdin.write(JSON.stringify(inputData));
      child.stdin.end();
    }
  });
}
