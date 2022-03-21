!function()
{
    try
    {
        let element = Page.element.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/2-integrals-intro/2-integrals-intro.html");
        });
    }
    
    catch(ex) {}
    
    
    
    try
    {
        let element = Page.element.querySelector("#home-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/252.html");
        });
    }
    
    catch(ex) {}
    
    
    
    try
    {
        let element = Page.element.querySelector("#previous-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/0-calc-1-review/0-calc-1-review.html");
        });
    }
    
    catch(ex) {}
    
    
    
    Page.show();
}()