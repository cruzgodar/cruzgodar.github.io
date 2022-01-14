!function()
{
    try
    {
        let element = document.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/7-exp-and-log-integrals/7-exp-and-log-integrals.html");
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
            Page.Navigation.redirect("/teaching/uo/252/notes/5-simple-applications/5-simple-applications.html");
        });
    }
    
    catch(ex) {}
}()