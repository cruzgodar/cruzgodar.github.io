!function()
{
    try
    {
        let element = Page.element.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/6-u-sub/6-u-sub.html");
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
            Page.Navigation.redirect("/teaching/uo/252/notes/4-ftoc/4-ftoc.html");
        });
    }
    
    catch(ex) {}
    
    
    
    Page.show();
}()