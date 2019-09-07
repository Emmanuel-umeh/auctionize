const contractSource = 'sophiaAuction.aes'; 


const contactAddress = 'ct_iDfWSfLFbskEqQKGCU5fpXw1iWGo1DHLQUYLBuKhsoHpmGPdR';
var ProductArray = [];
var client = null;
var productLength = 0;



function renderProduct()
{
    ProductArray = ProductArray.sort(function(a,b){return b.Price - a.Price})
    var template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {ProductArray});
    $('#productBody').html(rendered);
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

window.addEventListener('load', async () => {
    $('#loader').show();

    client = await Ae.Aepp();

    productLength = await callStatic('getProductLength', []); 
    
    for(let i = 1; i<= productLength; i++ ){
      const product =  await callStatic('getProduct', [i]);
    

      ProductArray.push({
        name : product.sold,
        url : product.nameofProduct,
        index : i,
        productName : product.url,
        Price : product.currentPrice 
    })
  }
  renderProduct();
  $('#loader').hide();
});

// document.getElementById("bidButton").addEventListener('click', function(event){
//     console.log(document.getElementById("input").value)
// });

jQuery("#productBody").on("click", ".bidButton", async function(event){
    const dataIndex = event.target.id;
    const foundIndex = ProductArray.findIndex(product => product.index == dataIndex);
    const value = $(".bid")[foundIndex].value ;
    console.log("the value",value);
    console.log(typeof value);
    
    ProductArray[foundIndex].Price += parseInt(value, 10);
    renderProduct();
});

// $(document).ready(function(){
//     $("#productBody").on("click", ".bidButton", async function(event){
//         const value = parseInt($(".bid").val()) ;
//         console.log(value)
//         console.log(typeof value)
//         // event.preventDefault();

//     })
//   });

$('#regButton').click(async function(){
    var name =($('#regSellerName').val()),
    price = parseInt(($('#regPrice').val()),10),
    url = ($('#regUrl').val()),
    productName = ($('#regProductName').val());

    console.log("Price:",price)
    console.log(typeof price);

    
    ProductArray.push({
        name : name,
        url : url,
        index : ProductArray.length + 1,
        productName : productName,
        Price : price 
    })
    renderProduct();
});