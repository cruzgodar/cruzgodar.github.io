!function()
{
    try
    {
        let element = document.querySelector("#next-button");
        
        element.addEventListener("click", () =>
        {
            Page.Navigation.redirect("/teaching/uo/252/notes/8-area-between-curves/8-area-between-curves.html");
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
            Page.Navigation.redirect("/teaching/uo/252/notes/6-u-sub/6-u-sub.html");
        });
    }
    
    catch(ex) {}
}()