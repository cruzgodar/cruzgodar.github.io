!function()
{
    try
    {
        let element = document.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/11-physical-applications/11-physical-applications.html");
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
            Page.Navigation.redirect("/teaching/uo/252/notes/9-solids-of-revolution/9-solids-of-revolution.html");
        });
    }
    
    catch(ex) {}
}()