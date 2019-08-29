contract Myauction =
  record product = { 
    creatorAddress  : address,
    url            : string,
    nameofProduct  : string,
    currentPrice   : int,
    timeLeft       : int}
  record state = {
    products : map(int,product),
    productLength : int}
    
  record bidders = {
    biddersAddress : address,
    bidProduct : int,
    updatedPrice : int
    }
  
  entrypoint init() = {products = {}, productLength = 0}
  
  entrypoint getProduct(index:int) : product = 
    switch(Map.lookup(index, state.products))
      None => abort("Product does not exist with this index")
      Some(x) => x
    
    
  stateful entrypoint registerProduct(
    name : string, 
    url : string,
    nameofProduct: string, 
    price: int, 
    timeLeft : int
    ) =

    
    let product = { 
      creatorAddress = Call.caller, 
      url = url, 
      nameofProduct = nameofProduct, 
      currentPrice = price, 
      timeLeft = 60} 
      
    let index = getProductLength() + 1
      
      
    put(state{products[index] = product, productLength  = index})
    
  
    
  entrypoint getProductLength() : int = 
    state.productLength
  
  stateful entrypoint bid(index: int) = 
    let product = getProduct(index)
    Chain.spend(product.creatorAddress, Call.value)
    let updatedBid = product.currentPrice + Call.value
    let updatedProduct = state.products{ [index].currentPrice = updatedBid}
    put(state { products = updatedProduct})
    
  stateful entrypoint bidders(index : int)  = 
    let bidders = {  
      biddersAddress = Call.caller,
      bidProduct = updatedProduct(index),
      updatedPrice = Contract.balance
      }
      
      