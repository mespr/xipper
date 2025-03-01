"use strict";

import Xipper from "../Xipper.mjs";
let xipper = new Xipper();
function OnLoadBody()
{
    ClearTextBoxes();
}

function ClearTextBoxes()
{    
    var boxes = ["originalBox","scrambledBox","descrambledBox"];       
    for (var i = 0; i < boxes.length; i++)
    {           
        document.getElementById(boxes[i]).value = "";
    }                
    
    var counters = ["originalCounter","scrambledCounter","descrambledCounter"];  
    for (var i = 0; i < boxes.length; i++)
    {           
        document.getElementById(counters[i]).value = "0";
    }              
}

function OnOriginalChange()
{    
    var key = "000102030405060708090A0B0C0D0E0F";

    var text = document.getElementById("originalBox").value;    
           
    // Perform computations
    var encryptedText = xipper.cloak(key, text).ciphered;
    var decryptedText = xipper.decloak(key, encryptedText).clear;
    
    // Display results      
    document.getElementById("scrambledBox").value = encryptedText;        
    document.getElementById("descrambledBox").value = decryptedText;   

    // Update counters    
    document.getElementById("originalCounter").value = text.length;    
    document.getElementById("scrambledCounter").value = encryptedText.length;        
    document.getElementById("descrambledCounter").value = decryptedText.length;   
}
