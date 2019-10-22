const contractSource = `
contract MyAuction =

  record product = 
    { creatorAddress : address,
      url            : string,
      nameofProduct  : string,
      currentPrice   : int,
      description  : string,
      sold           : bool,
      reviews        : int}

  record state = 
    { products : map(int, product),
      productLength : int,
      bidders : map(int,address),
      bidderLength : int }

  entrypoint init() = 
    { products = {}, 
      productLength = 0,
      bidders = {},
      bidderLength = 0 }

  entrypoint getProduct(index:int) : product = 
    switch(Map.lookup(index, state.products))
      None => abort("Product does not exist with this index")
      Some(x) => x  

  stateful entrypoint registerProduct(url' : string, nameofProduct': string, description' : string, currentPrice': int) =
    let product = { creatorAddress = Call.caller, url = url', nameofProduct = nameofProduct', currentPrice = currentPrice', description = description', sold = false, reviews = state.bidderLength}  
    let index = getProductLength() + 1 
    put(state{products[index] = product, productLength  = index})


  entrypoint getProductLength() : int = 
    state.productLength



  //bid functionality

  stateful entrypoint bid(index: int) =
    let product = getProduct(index)
    let addresses = Call.caller
    let updatedBid = Call.value
    let contractBalance = getContractBalance()
    put(state{bidders[index]= addresses})

    biddingSecurity()


    if(product.sold == true)
      abort("product has been sold")
    //first bid
    if(Call.value > product.currentPrice &&  contractBalance == 0)
      Chain.spend(Contract.address, Call.value)
    
    
      //second bid
    if(Call.value > product.currentPrice && contractBalance != 0)
      let previousbidder = getBidderAddress(index-1)
      Chain.spend(previousbidder,Contract.balance)
  
    elif(Call.value < updatedBid)
      abort("your bid is lower than the current bid")
    else
      abort("you need to enter a value higher than 0 ")
    let updatedProduct = state.products{ [index].currentPrice = updatedBid}
    let index = getBidderLength() + 1


    put(state { products = updatedProduct})
    
    put(state{bidderLength = index})


  //length of registered bidders
  entrypoint getBidderLength() : int = 
    state.bidderLength   


  //stores address of registered bidsers

  entrypoint getBidderAddress(index:int) = 
    switch(Map.lookup(index, state.bidders))
      None => abort("bidder does not exist with this index")
      Some(x) => x 

  // stateful entrypoint bidders(name:string)  = 
  // let bidder = { bidderAddress = Call.caller, updatedPrice = Call.value, name = name }
  //let index = getBidderLength() + 1
  //put(state{bidders[index] = bidders, bidderLength  = index})
  //put(state{bidders[index] = bidders, bidders  = bidder})

  stateful entrypoint closeBid(index : int) = 
    put(state{products[index].sold = true})
    let product = getProduct(index)
    let total = Contract.balance
    let creatorsAddress = product.creatorAddress
    Chain.spend(creatorsAddress: address, product.currentPrice: int)


  public entrypoint getContractBalance() : int =
    Contract.balance

  public entrypoint getContractowner() : address =
    Contract.creator

  stateful entrypoint biddingSecurity() = 
    if(Call.caller == Contract.creator)
      abort("you cannot bid on your own product")`; 


const contractAddress = 'ct_VUsst8aspzLL5v1bVxyfrQ1uAkbs2ySBTcV7tJdRyZhZtRWih';
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
    console.log("for loop reached")
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  console.log("Contract : ", contract)
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  console.log("Called get found: ",  calledGet)
  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("catching errors : ", decodedGet)
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  $("#loadings").show();

  client = await Ae.Aepp()

  productLength = await callStatic('getProductLength', []); 
    
  for(let i = 1; i<= productLength; i++ ){
    const product =  await callStatic('getProduct', [i]);
    
    console.log("for loop reached")

    ProductArray.push({
      sold : product.sold,
      url : product.url,
      index : i,
      productNames : product.nameofProduct,
      Price : product.currentPrice ,
      review : product.reviews
  })
}
  renderProduct();
  $("#loadings").hide();
});

// document.getElementById("bidButton").addEventListener('click', function(event){
//     console.log(document.getElementById("input").value)
// });

$("#productBody").on("click", ".bidButton", async function(event){
  $("#loadings").show();
    var review = 0;
    const dataIndex = event.target.id;
    const foundIndex = ProductArray.findIndex(product => product.index == dataIndex);
    const value = $(".bid")[foundIndex].value ;

    
    await contractCall('bid', [dataIndex], value)
    
    console.log("the value",value);
    console.log(typeof value);
    
    
    ProductArray[foundIndex].Price += parseInt(value, 10);
    renderProduct();

    ProductArray.push({
      review : review + 1
  })

    $("#loadings").hide();
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
  $("#loadings").show();
    var name =($('#sellerName').val()),
    price = parseInt(($('#regPrice').val()),10),
    url = ($('#regUrl').val()),
    productName = ($('#regName').val());
    description = ($('#productDescription').val());
    await contractCall('registerProduct', [url,productName,description,price])
    console.log(name)

    
    ProductArray.push({
        name : name,
        url : url,
        index : ProductArray.length + 1,
        productName : productName,
        description : description,

        Price : price 
    })
    renderProduct();
    $("#loadings").hide();
});