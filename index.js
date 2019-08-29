var ProductArray = [
    {"name":"Emmanuel", "url":"/assets/img/bg-showcase-1.jpg", "productName":"Phone cover", "Price": 6000, "index":1},
    {"name":"Mega", "url":"https://cdn.vox-cdn.com/thumbor/rRgA9WIf_N14Quqqthkpw3Jv3I8=/0x0:2625x1907/920x613/filters:focal(1103x744:1523x1164):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/52187575/jbareham_160418_0931_0086_FINAL_NO_BUFFER_5MB_02.0.0.jpeg", "productName":"gadgets", "Price": 7000, "index":2},
    {"name":"Chains", "url":"https://i0.wp.com/gizmosscan.com/wp-content/uploads/2019/01/business-camera-contemporary-325153-e1546428282854.jpg?resize=696%2C376&ssl=1", "productName":"Game Pad", "Price": 4000, "index":3}

];

function renderProduct()
{
    ProductArray = ProductArray.sort(function(a,b){return b.Price - a.Price})
    var template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {ProductArray});
    $('#productBody').html(rendered);
}

window.addEventListener('load', async () => {
    renderProduct();
});

// jQuery("#productBody").on("click", ".bidButton", async function(event){
//     const value = $("#productBody").siblings('.bid').val();
//     // const value = parseInt($(".bid").val());

//     console.log("the value",value);
//     console.log(typeof value);
//     const dataIndex = event.target.id;
//     const foundIndex = ProductArray.findIndex(product => product.index == dataIndex);
//     ProductArray[foundIndex].Price += parseInt(value, 10);
//     renderProduct();
// })

$(document).ready(function(){
    $("#productBody").on("click", ".bidButton", async function(event){
        const value = parseInt($(".bid").val()) ;
        console.log(value)
        console.log(typeof value)
        // event.preventDefault();

    })
  });

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

