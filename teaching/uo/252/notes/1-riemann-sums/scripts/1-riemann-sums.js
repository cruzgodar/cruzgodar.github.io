!function()
{
    try
    {
        let element = document.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/1-riemann-sums/1-riemann-sums.html");
        });
    }
    
    catch(ex) {}
    
    
    
    try
    {
        let element = document.querySelector("#home-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/252.html");
        });
    }
    
    catch(ex) {}
    
    
    
    try
    {
        let element = document.querySelector("#previous-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/0-calc-1-review/0-calc-1-review.html");
        });
    }
    
    catch(ex) {}
}()