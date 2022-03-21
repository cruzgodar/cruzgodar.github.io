!function()
{
    try
    {
        let element = Page.element.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/13-trig-sub/13-trig-sub.html");
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
            Page.Navigation.redirect("/teaching/uo/252/notes/11-physical-applications/11-physical-applications.html");
        });
    }
    
    catch(ex) {}
    
    
    
    Page.show();
}()