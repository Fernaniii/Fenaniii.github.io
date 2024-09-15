const display = document.getElementById('display');
const buttons = Array.from(document.getElementsByClassName('btn'));

buttons.map(button => {
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
        } else {
            if (display.innerText === '0') {
                display.innerText = buttonText;
            } else {
                display.innerText += buttonText;
            }
        }
    });
});
