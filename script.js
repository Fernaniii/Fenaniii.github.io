
document.addEventListener("DOMContentLoaded", function() {
    const parent = document.getElementById("card__header");
    const child = document.getElementById("card__title");

    function adjustFontColor() {
        const bgColor = window.getComputedStyle(parent).backgroundColor;
        const rgb = bgColor.match(/\d+/g);
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

        if (brightness > 125) {
            child.style.color = "#000";
        } else {
            child.style.color = "#fff";
        }
    }

    adjustFontColor();

    // Optionally, update the font color dynamically if the background color changes
    const observer = new MutationObserver(adjustFontColor);
    observer.observe(parent, { attributes: true, attributeFilter: ["style"] });
});
