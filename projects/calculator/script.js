const buttons = document.querySelectorAll('.btn');
const display = document.getElementById('display');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonText = e.target.innerText;

        if (buttonText === '=') {
            try {
                display.innerText = eval(display.innerText);
            } catch {
                display.innerText = 'Error';
            }
        } else if (buttonText === 'C') {
            display.innerText = '0';
        } else if (buttonText === '←') {
            display.innerText = display.innerText.slice(0, -1) || '0';
        } else if (buttonText === '√') {
            try {
                display.innerText = Math.sqrt(eval(display.innerText));
            } catch {
                display.innerText = 'Error';
            }
        } else if (buttonText === '±') {
            if (display.innerText !== '0') {
                if (display.innerText.startsWith('-')) {
                    display.innerText = display.innerText.substring(1);
                } else {
                    display.innerText = '-' + display.innerText;
                }
            }
        } else {
            if (display.innerText === '0') {
                display.innerText = buttonText;
            } else {
                display.innerText += buttonText;
            }
        }
    });
});
