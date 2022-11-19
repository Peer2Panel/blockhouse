async function main () {

    monthly_payment = 5;        //USD
    remaining_payments = 240;
    book_IRR = 12;              //in %/year
    listing_price = 420;        //USD

    Book_value = calculate_HouseT_Book_Value(monthly_payment, remaining_payments, book_IRR);
    console.log('Book value for this panel is', Book_value.toFixed(2), 'USD')

    computed_IRR = calculate_IRR(monthly_payment, remaining_payments, listing_price);
    console.log('IRR for a listing price of', listing_price.toFixed(2), 'USD is', computed_IRR.toFixed(2),'%')

}


function calculate_HouseT_Book_Value(monthly_payment, remaining_payments, annual_IRR) {  //IRR in %/year

    r = annual_IRR/12/100;
    N = remaining_payments;
    m0 = monthly_payment;
    HouseTvalue = m0*((1+r)**N - 1)/(r * (1+r)**N);

    return HouseTvalue;
}


function calculate_IRR(monthly_payment, remaining_payments, listing_price) {


    var monthly_returns = [];

    monthly_returns.push(-listing_price);
    for (i = 0; i < remaining_payments; i++) {
        monthly_returns.push(monthly_payment);
    }
    
    function IRRCalc(CArray) {

        min = 0.0;
        max = 1.0;
        do {
          guest = (min + max) / 2;
          NPV = 0;
          for (var j=0; j<CArray.length; j++) {
                NPV += CArray[j]/Math.pow((1+guest),j);
          }
          if (NPV > 0) {
            min = guest;
          }
          else {
            max = guest;
          }
        } while(Math.abs(NPV) > 0.000001);
        return guest * 100;
    }

    var IRR = IRRCalc(monthly_returns, 0.01)*12;

    return IRR;
}

export { calculate_HouseT_Book_Value, calculate_IRR }