﻿    function createMenu(CurrentPosition) {
        try{
        var StringList = [loc(sp.settings), loc(sp.deleteGroup), loc(sp.importFile), loc(sp.exportFile), loc(sp.addGroup),loc(sp.importPicture), loc(sp.addElement), loc(sp.deleteElement), loc(sp.create), loc(sp.cover), loc(sp.isShow), loc(sp.isAlert), loc(sp.isPrecomp), loc(sp.isOffset), loc(sp.isName), loc(sp.isEffect),loc(sp.cleanProperty),loc(sp.offsetKey)];
        var length = StringList.length;
        var Space = 102 / 5;
        var h;
        var buttonWidth = 40;
        var checkBoxWidth = 41;
        var buttonHeight = 20;
        var checkBoxHeight = 21;
        if (sp.lang == "ch") 
            var h = 180;
        else
            var h = 190;
        var ShortMenu = new Window("palette", "huhu", [0, 0, h, length * Space / 2 + 42], {borderless: true});

            for (var n = 0; n < length; n++) {
                if (n == 0) {
                    ShortMenu._0=ShortMenu.add("button",[0,0,h/2,22],StringList[0]);
                } else if (n <= 9) {
                    if (n % 2 == 0) {
                        ShortMenu["_" + (n + 1) ] =ShortMenu.add("button",[0,(parseInt((n) / 2) * buttonHeight + buttonWidth),h/2,(22 + parseInt((n) / 2) * buttonHeight + buttonWidth)],StringList[n]);
                    } else {
                        ShortMenu["_" + (n + 1) ] =ShortMenu.add("button",[h/2,(parseInt((n-1) / 2) *buttonHeight +buttonWidth),h,(22 + parseInt((n-1) / 2) * buttonHeight +buttonWidth)],StringList[n]);
                    }
                } else {
                    if (n % 2 == 0) {
                        ShortMenu["_" + (n + 1) ] =ShortMenu.add("checkbox",[0,(parseInt((n) / 2) * checkBoxHeight +checkBoxWidth),h/2,(22 + parseInt((n) / 2) * checkBoxHeight + checkBoxWidth)],StringList[n]);
                   } else {
                        ShortMenu["_" + (n + 1) ] =ShortMenu.add("checkbox",[h/2,(parseInt((n-1) / 2) * checkBoxHeight + checkBoxWidth),h,(22 + parseInt((n-1) / 2) * checkBoxHeight + checkBoxWidth)],StringList[n]);
                   }
                }
            }
            ShortMenu._yushe=ShortMenu.add("button",[0,20,h,42],loc(sp.yushe));
            ShortMenu._c = ShortMenu.add("button", [0, 42, h/2, 62], loc(sp.changeName));
            ShortMenu._1 = ShortMenu.add("dropdownlist", [h/2, 0,h, 22]);
            ShortMenu._1.add("item", loc(sp.save));
            ShortMenu._1.add("item", loc(sp.exp));
            ShortMenu._1.add("item", loc(sp.aep));
            ShortMenu._1.add("item", loc(sp.preset));
            ShortMenu._1.add("item", loc(sp.curve));
            ShortMenu._1.selection = 0;
            ShortMenu._1.enabled = true;
            ShortMenu._11.value = sp.showThumbValue ;
            ShortMenu._12.value = sp.deleteAlertValue ;
            ShortMenu._13.value = sp.preComposeValue;
            ShortMenu._14.value = sp.saveMaterialValue;
            ShortMenu._15.value = sp.autoNameValue;
            ShortMenu._16.value = sp.onlyEffectValue;
            ShortMenu._17.value = sp.cleanGroupValue;
            ShortMenu._18.value = sp.offsetKeyframeValue;

            ShortMenu._1.onChange=ShortMenu._1.onChanging =function(){
                      try {     
                        //run sp_translate script
                        this.selection.index == 1 &&
                            translate()  ||
                        
                        //generate and then save the whole group
                        this.selection.index == 2 &&
                           reloadPic()  ||
                        
                        //auto save every layer in current comp,one layer as one element
                        this.selection.index == 3 &&
                           autoSave()  ||
                        
                        //cut layers' length by opacity and comp length
                        this.selection.index == 4 &&
                           cutLength();
                           
                        } catch (err) {err.printa();}
                        
                        //back list's selection
                        this.selection = 0;
                }
          
            var isCheckBoxClicked = false;

            
            
            ShortMenu._yushe.onClick=function(){
                presetWindow();
                isCheckBoxClicked = false;
                ShortMenu.close();
                }
            
            ShortMenu._c.onClick = function(){
                    sp.fns.changeName();
                    isCheckBoxClicked = false;
                    ShortMenu.close();
                }
            
            ShortMenu._0.onClick = function() {
                settingsButtonFunc();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
            
            ShortMenu._2.onClick = function() {
                sp.fns.deleteGroup();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
      
            ShortMenu._3.onClick = function() {
                sp.fns.importFiles();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
      
            ShortMenu._4.onClick = function() {
                sp.fns.exportFile ();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
      
            ShortMenu._5.onClick = function() {
                sp.fns.addGroup();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
      
            ShortMenu._6.onClick = function() {
                sp.fns.importImage();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
      
            ShortMenu._7.onClick = function() {
                isCheckBoxClicked = false;
                ShortMenu.close();
                sp.fns.newItem();
            }
      
            ShortMenu._8.onClick = function() {
                sp.fns.deleteItem();
                isCheckBoxClicked = false;
                ShortMenu.close();
            }
      
            ShortMenu._9.onClick = function() {
                isCheckBoxClicked = false;
                ShortMenu.close();
                sp.fns.newLayer();
            }
      
            ShortMenu._10.onClick = function() {
                isCheckBoxClicked = false;
                ShortMenu.close();
                sp.fns.cover();
            }
      
            ShortMenu._11.onClick = function(){
                     sp.showThumbValue = this.value;
                     gv.showText = this.value;
                     sp.saveSetting("showThumb",this.value.toString());
                     isCheckBoxClicked = true;
                     sp.gv.refresh();
                }            
            ShortMenu._12.onClick = function(){
                     sp.deleteAlertValue = this.value;
                     sp.saveSetting("deleteAlert",this.value.toString());
                     isCheckBoxClicked = true;
                }      
            ShortMenu._13.onClick = function(){
                     sp.preComposeValue = this.value;
                     sp.saveSetting("preCompose",this.value.toString());
                     isCheckBoxClicked = true;
                }      
            ShortMenu._14.onClick = function(){
                     sp.saveMaterialValue = this.value;
                     sp.saveSetting("saveMaterial",this.value.toString());
                     isCheckBoxClicked = true;
                }      
            ShortMenu._15.onClick = function(){
                     sp.autoNameValue = this.value;
                     sp.saveSetting("autoName",this.value.toString());
                     isCheckBoxClicked = true;
                }      
            ShortMenu._16.onClick = function(){
                     sp.onlyEffectValue = this.value;
                     sp.saveSetting("onlyEffect",this.value.toString());
                     isCheckBoxClicked = true;
                }      
            ShortMenu._17.onClick = function(){
                     sp.cleanGroupValue = this.value;
                     sp.saveSetting("cleanGroup",this.value.toString());
                     isCheckBoxClicked = true;
                }      
            ShortMenu._18.onClick = function(){
                     sp.offsetKeyframeValue = this.value;
                     sp.saveSetting("offsetKeyframe",this.value.toString());
                     isCheckBoxClicked = true;
                }

        
    
        ShortMenu.addEventListener("blur", function() {
            if (isCheckBoxClicked == false) {
                ShortMenu.close();
            } else {
                isCheckBoxClicked = true;
            }
        });
    
        ShortMenu.onDeactivate = function() {
            ShortMenu.close();
        }
    
        ShortMenu.frameLocation = CurrentPosition;
        ShortMenu.show();
        ShortMenu.addEventListener("keydown",function(event){ShortMenu.close();});
        }catch(err){err.printa()}
      }