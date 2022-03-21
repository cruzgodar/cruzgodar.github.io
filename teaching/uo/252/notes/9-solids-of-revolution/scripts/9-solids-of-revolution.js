!function()
{
    try
    {
        let element = Page.element.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/10-arc-length-and-surface-area/10-arc-length-and-surface-area.html");
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
            Page.Navigation.redirect("/teaching/uo/252/notes/8-area-between-curves/8-area-between-curves.html");
        });
    }
    
    catch(ex) {}
    
    
    
    Page.show();
}()