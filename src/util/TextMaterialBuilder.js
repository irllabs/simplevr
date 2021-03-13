const fontSize = 26;

class TextLine {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
    }
}

function printWrappedText(context, text, x, y, maxWidth, lineHeight) {
    const lines = [];
    const wordList = text.split(/(\s+)/);
    let lineContent = '';

    wordList.forEach((word) => {
        const proposedLine = `${lineContent + word} `;
        const metrics = context.measureText(proposedLine);

        if (metrics.width > maxWidth) {
            lines.push(new TextLine(x, y, lineContent.trim()));
            lineContent = `${word} `;
            y += lineHeight;
        } else {
            lineContent = proposedLine;
        }
    });

    lines.push(new TextLine(x, y, lineContent.trim()));

    return lines;
}

export default function getTextureSizeFromText(textContext) {
    const width = 2 * 600;
    const drawCanvas = document.createElement('canvas');
    const g2d = drawCanvas.getContext('2d');
    const fixedFontSize = fontSize * 2;

    drawCanvas.width = width;
    drawCanvas.height = 2 * 800;
    g2d.font = `${fixedFontSize}pt Nunito`;
    g2d.fillStyle = 'rgba(0, 0, 0, 0.7)';
    g2d.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    g2d.fillStyle = 'white';

    const textLines = printWrappedText(g2d, textContext, 10, fixedFontSize + 10, width, fixedFontSize + 8);
    const height = textLines[textLines.length - 1].y + fixedFontSize;

    // Print text onto canvas
    textLines.forEach((textLine) => {
        return g2d.fillText(textLine.text, textLine.x, textLine.y);
    });

    return {
        width: width,
        height: height,
        drawCanvas: drawCanvas,
    };
}
