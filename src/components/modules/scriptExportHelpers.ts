// scriptExportHelpers.ts
// Utilities for exporting scripts to various formats (e.g., XML for DaVinci Resolve)

export function exportScriptToXML(script: string): string {
  // Simple XML export for demonstration; expand as needed for real use
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Script>\n  <Content>${escapeXML(script)}</Content>\n</Script>`;
}

export function exportScriptToFCPXML(script: string): string {
  // Parse script into scenes and timestamps
  const lines = script.split(/\r?\n/);
  let xmlScenes = '';
  let sceneCount = 0;
  let offsetSeconds = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      sceneCount++;
      xmlScenes += `              <title name="Scene ${sceneCount}" lane="1" offset="${offsetSeconds}s" duration="60s">\n`;
    } else if (line.match(/^\[\d{2}:\d{2}/)) {
      xmlScenes += `                <text>${escapeXML(line)}</text>\n`;
    } else if (line.startsWith('SPEAKER:')) {
      xmlScenes += `                <text>${escapeXML(line)}</text>\n`;
    } else if (line.length > 0) {
      xmlScenes += `                <text>${escapeXML(line)}</text>\n`;
    }
    if (line.startsWith('#')) {
      xmlScenes += '              </title>\n';
      offsetSeconds += 60;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<fcpxml version="1.9">\n  <resources>\n    <format id="r1" name="FFVideoFormat1080p24" frameDuration="1/24s"/>\n  </resources>\n  <library>\n    <event name="Script Import">\n      <project name="Script">\n        <sequence format="r1" duration="3600s">\n          <spine>\n            <gap duration="3600s">\n${xmlScenes}            </gap>\n          </spine>\n        </sequence>\n      </project>\n    </event>\n  </library>\n</fcpxml>`;
}

function escapeXML(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}
