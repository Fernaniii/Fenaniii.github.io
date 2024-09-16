function calculateTotal() {
    // Define prices for each item
    const cheeseburgerPrice = 5.00;
    const friesPrice = 2.50;
    const sodaPrice = 1.50;
    const saladPrice = 3.00;

    // Get quantities from input fields
    const cheeseburgerQty = parseInt(document.getElementById('cheeseburger-qty').value) || 0;
    const friesQty = parseInt(document.getElementById('fries-qty').value) || 0;
    const sodaQty = parseInt(document.getElementById('soda-qty').value) || 0;
    const saladQty = parseInt(document.getElementById('salad-qty').value) || 0;

    // Calculate total
    const total = (cheeseburgerPrice * cheeseburgerQty) +
                  (friesPrice * friesQty) +
                  (sodaPrice * sodaQty) +
                  (saladPrice * saladQty);

    // Display total
    document.getElementById('total').innerText = total.toFixed(2);
}
