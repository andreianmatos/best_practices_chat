let textLines = [];
let userInput = '';

const sketch = (p) => {
    let canvas;
    let input;

    p.setup = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        canvas = p.createCanvas(windowWidth, windowHeight);
        canvas.parent('sketch-container');
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(25);

        // Create the input box inside the canvas
        const inputWidth = 300;
        const inputHeight = 40;
        const posX = (windowWidth - inputWidth) / 2;
        const posY = (windowHeight - inputHeight) / 2;
        input = p.createInput();
        input.position(posX, posY);
        input.size(inputWidth, inputHeight);
        input.changed(handleInput); // Trigger the function on pressing Enter
    };

    p.draw = () => {
        p.background(40);        

        for (let i = 0; i < textLines.length; i++) {
            let textData = textLines[i];

            let lines = textData.text.split('\n');

            // Move the text upwards for each line
            textData.textY -= 1;

            let y = p.height + textData.textY;

            // Change color for generated text
            if (textData.isInput) {
                p.fill(255);
            } else {
                p.fill(p.color(0, p.random(190,220), 0)); 
            }

            // Draw each line of text within window boundaries
            for (let j = 0; j < lines.length; j++) {
                if (y > 0 && y < p.height) {
                    // Justify and draw text only if it is within the window height
                    p.text(lines[j], 20, y, p.width - 40, p.height);
                }
                y += 30; // line spacing
            }

            // Remove the text if it goes off-screen
            if (textData.textY < -lines.length * 30 - p.height) {
                textLines.splice(i, 1);
            }
        }
    };

    // Added prompt for generation...
    function handleInput() {
        userInput = input.value();
        input.value('');

        if (userInput.trim() !== '') {
            textLines.push({ text: userInput, textY: 0, isInput: true });
            generateText(userInput);
        }
    }
};

new p5(sketch);

async function generateText(promptText) {
    console.log(promptText);
    try {
        const HF_API_TOKEN = "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";
        const model = "blasees/gpt2_bestpractices";
        const data = { inputs: promptText || " " };

        console.log("doing inference with prompt...");
        console.log(promptText);

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: { "Authorization": `Bearer ${HF_API_TOKEN}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();

        console.log("generated....");
        console.log(result[0]["generated_text"]);

        // Store the generated text and its scroll position separately for each line
        let lines = result[0]["generated_text"].split('\n');
        for (let i = 0; i < lines.length; i++) {
            textLines.push({ text: lines[i], textY: 0, isInput: false });
        }

    } catch (error) {
        console.error("Error:", error);
    }
}
