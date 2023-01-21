import React, { createContext, useState } from 'react';

 const UIContext = createContext({ 
   
    selectedMenu:'Blogs',
    setSelectedMenu:()=>{},
   

});

export const UIContextProvider = (props) => {
   
    const [selectedMenu,setSelectedMenu]=useState(0);
   
    const context = {
            
        selectedMenu,
        setSelectedMenu

    }

    return <UIContext.Provider value={context}>
        {props.children}
    </UIContext.Provider>

}

export default UIContext;