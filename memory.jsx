﻿try{
(function(global){
    #include 'Sp_memory/lib/StringResource.jsx'
    #include 'Sp_memory/lib/GridView.jsx'
    #include 'Sp_memory/lib/UIParser.jsx'
    #include 'Sp_memory/lib/HelperScripts.jsx'
    #include 'Sp_memory/lib/SubSystems.jsx'
    #include 'Sp_memory/lib/RightClickMenu.jsx'
    var fns = sp.fns = new fns();
    
    var win = global instanceof Panel ? global : new Window("window",sp.scriptName, undefined, {resizeable: true});
    var group1 = win.add("Group{orientation: 'column', alignment: ['fill','fill'],spacing:0,margins:0}");
    var group11 = group1.add("Group{orientation: 'row', alignment: ['fill','fill'],spacing:0,margins:0}");
    var droplist  = sp.droplist = group1.add("Dropdownlist{}");
    var gv = sp.gv = new GridView(group1);
    


    gv.limitText = sp.getSettingAsBool ("limitText");
    gv.showText = sp.showThumbValue ;
    gv.version =  parseInt(app.version.split(".")[0])==12?"CC":"CC2014";
    

    gv.rightClick = fns.rightClick;
    gv.leftDoubleClick = fns.newLayer;
    droplist.onChange = fns.droplistChange;
    sp.reloadDroplist();
    droplist.selection = parseInt(sp.getSetting("thisSelection"));
    win.onResize =win.onResizing =fns.winResize;
    
    if(win instanceof Panel){    // show Panel
            win.layout.layout(1);         
        }else{                            // show Palette
            win.location=sp.getSetting("winLocation").split(",");
            win.show();      
            win.size=sp.getSetting ("winSize").split(",");
            win.onClose= fns.winClose;
    }

    win.onResize();

    

    function fns(){
           var keepRef = this;
          
            this.cover  = function(){
                  
                  },
            
            this.newLayer  = function(){

                  },

            this.newItem  = function(){

                  },

            this.deleteItem  = function(){
                          if(sp.gv.selection.length == 0) return;
                          if(sp.deleteAlertValue == true)
                              var sure = confirm(loc(sp.sureDelete));
                          if(sp.deleteAlertValue == true && sure== false)  return;

                          var file = sp.getFileByName(sp.droplist.selection.text);
                          var xml = new XML(file.readd());
                          sp.gv.selection.forEach(function(item,index){
                                      xml.child(item.index).setLocalName("waitToDelete");
                                      var preText = item.text;
                                      var image = sp.getImageFile(sp.droplist.selection.text,preText);
                                      if(image.exists)
                                          image.remove();    
                                });
                          delete xml.waitToDelete;
                          if(xml.children().length() !=0){
                                  file.writee(xml);
                             }else{
                                  file.writee("<tree></tree>");
                             }
                        
                          sp.gv.removeAll();
                          sp.droplist.notify("onChange");
                          sp.gv.refresh();
                  },

            this.importImage  = function(){
                        if(!sp.gv.lastSelectedItem) return;
                        var file = File.openDialog("Please select pictures", false);
                        if(!file) return;
                        if(file.name.split(".").last() != "jpg" && file.name.split(".").last() != "png") return;
                        var imageFile = sp.getImageFile(sp.droplist.selection.text,sp.gv.lastSelectedItem.text);
                        sp.cropImage(file,imageFile);
                        sp.gv.lastSelectedItem.image = imageFile;
                        sp.gv.refresh();
                  },
          
            this.deleteGroup  = function(){
                        var isSureDelete = confirm(loc(sp.isSureGroup));
                        if (isSureDelete == true) isSureDelete = confirm(loc(sp.isSureGroup2));
                        if (isSureDelete == false) return;
                        
                        var selectionIndex = sp.droplist.selection.index;
                        var imageFolder = sp.getImageFolderByName(sp.droplist.selection.text);
                        var images = imageFolder.getFiles();
                        images.forEach(function(item){
                                    item.remove();
                              });
                        imageFolder.remove();
                        
                        var file = sp.getFileByName(sp.droplist.selection.text);
                        file.remove();
                        var xml = new XML(sp.settingsFile.readd());
                        xml.ListItems.child(selectionIndex).setLocalName("waitToDelete");
                        delete xml.ListItems.waitToDelete;
                        sp.settingsFile.writee(xml);
                        sp.reloadDroplist();
                        sp.droplist.selection = selectionIndex==0 ? 0 :selectionIndex -1;
                        sp.gv.refresh();
                  },
          
            this.addGroup  = function(){
                    var newEleName = prompt(loc(sp.setName), "Default");
                    if (!newEleName){ alert(loc(sp.blankName));return;}
                    if(sp.lookUpTextInChildren(newEleName,sp.droplist.items)){alert(loc(sp.existName));return;}
                    var file = sp.getFileByName(newEleName);
                    sp.getImageFolderByName(newEleName);
                    var str = "<tree></tree>";
                    file.writee(str);
                    var xml = new XML(sp.settingsFile.readd());
                    xml.ListItems.appendChild(new XML("<Name>" + newEleName + "</Name>"));
                    sp.settingsFile.writee(xml);
                    sp.reloadDroplist();
                    sp.droplist.selection = sp.droplist.items.length -1;
                    sp.gv.refresh();
                  },
          
            this.exportFile  = function(){
                        var exportFolder = Folder.selectDialog("Please select folder");
                        if(!exportFolder) return;
                        if(!(exportFolder instanceof Folder)) return;
                        var sourceFile = sp.getFileByName(sp.droplist.selection.text);
                        var targetFile = File(exportFolder.toString() + sp.slash + sp.droplist.selection.text + ".xml");
                        if(targetFile.exists) {alert(loc(sp.overWritten)); return; }
                        
                        var images= sp.getImageFolderByName(sp.droplist.selection.text).getFiles();
                        var picXml = new XML("<pic></pic>");
                        images.forEach(function(item,index){
                                      if(item.name.indexOf(".png") !=1){
                                                  item.open("r");
                                                  item.encoding = "binary";
                                                  var str = encodeURIComponent (item.read());
                                                  item.close();
                                                  var tempXmlBigHere=new XML("<imgName>"+encodeURIComponent(item.name)+"</imgName>");
                                                  var tempXmlHeres=new XML("<img>"+str+"</img>");
                                                  var guluTempA=new XML("<imgInfo></imgInfo>");
                                                  guluTempA.appendChild(tempXmlBigHere);
                                                  guluTempA.appendChild(tempXmlHeres);
                                                  picXml.appendChild (guluTempA);
                                            }
                              });
                        var xml = new XML(sourceFile.readd());
                        if(picXml.children().length()>0){
                                    xml.appendChild (picXml);
                              }
                        if(xml.children().length()==0){
                                    xml = "<tree></tree>"
                              }
                        targetFile.writee(xml);
                        clearOutput();
                        writeLn("Complete!");
                              
                  },
          
          
            //~ function to import XML files
            this.importFiles = function(){
                  var files = File.openDialog("Please select xmls", "*.xml", true);
                  if(!files) return;
                  var selectionIndex = sp.droplist.selection.index;
                  files.forEach(function(item,index){
                              var file = sp.getFileByName(item.name.replace(".xml",""));
                              if(file.exists) return;
                              var imageFolder= sp.getImageFolderByName(item.name.replace(".xml",""));
                              item.copy(file.toString());
                              var xml = new XML(file.readd());
                               sp.forEach(xml.pic,function(item,index){
                                                 var image = sp.getImageFile(this.name.replace(".xml",""),decodeURIComponent (item.imgName.toString()).replace(".png",""));
                                                 image.open("w");
                                                 image.encoding = "binary";
                                                 image.write(decodeURIComponent (item.img.toString()));
                                                 image.close();
                                         },item);
                               delete xml.pic;
                               file.writee(xml);
                               xml = new XML(sp.settingsFile.readd());
                               xml.ListItems.appendChild(new XML("<Name>" + decodeURIComponent(item.name.replace(".xml","")) + "</Name>"));
                               sp.settingsFile.writee(xml.toString());
                        });
                    sp.reloadDroplist();
                    sp.droplist.selection = sp.droplist.items.length -1 ;
                    sp.gv.refresh();
                  },
            //~   the function which change element name
            this.changeName=function (){
                    if (!sp.gv.children) return;
                    var newEleName = prompt(loc(sp.setName), sp.gv.lastSelectedItem.text);
                    if (!newEleName){ alert(loc(sp.blankName));return;}
                    if(sp.lookUpTextInChildren(newEleName,sp.gv.children)){alert(loc(sp.existName));return;}
                    
                    var file = sp.getFileByName(sp.droplist.selection.text);
                    var image = sp.getImage(sp.droplist.selection.text,sp.gv.lastSelectedItem.text);
           
                    if (sp.gv.lastSelectedItem.text === decodeURIComponent(sp.inXml.child(sp.gv.lastSelectedItem.index).@name)) {
                        sp.inXml.child(sp.gv.lastSelectedItem.index).@name = encodeURIComponent(newEleName.toString());
                        file.writee(sp.inXml);
                    }
                    
                    var targetImage = sp.noImage;
                    if (image.exists) {
                        image.rename(newEleName.toString() + ".png");
                        targetImage = sp.getImage(sp.droplist.selection.text,newEleName.toString());
                        if (image.toString() != targetImage.toString()) 
                            image.remove();
                    }
                
                    sp.gv.lastSelectedItem.text = newEleName.toString();
                    sp.gv.lastSelectedItem.image = targetImage;
                    sp.gv.refresh();
                },
            //~   the function called when dropdownlist's selection changes
            this.droplistChange = function(){
                    if(!this.selection) return;
                    var text = this.selection.text;
                    var file = sp.getFileByName(text);
                    if(file ==-1) return;
                    var xml = new XML(file.readd());
                    sp.inXml = xml;
                    sp.gv.removeAll();
                    sp.forEach(xml,function(item,index){
                            var name = decodeURIComponent (item.@name);
                            var imageFile = sp.getImage(text,name);
                            this.add(name,imageFile)
                        },sp.gv);
                    sp.saveSetting("thisSelection",this.selection.index.toString());
                    var arr = sp.getSetting ("effectName").split(",");
                    if(sp.lookUpInArray(sp.droplist.selection.text,arr))
                        sp.onlyEffectValue = true;
                    else
                        sp.onlyEffectValue = false;
                    sp.saveSetting("onlyEffect",sp.onlyEffectValue.toString());
                    sp.droplist.itemSize.height = 20;
                }
            //~   the function called when window has been resized
            this.winResize = function(){
                    group1.location = [2,0];
                    group1.size = [win.size[0],win.size[1]];
                    gv.size([group1.size[0],group1.size[1]-20]);
                    group11.location = [1,1];
                    group11.size.width = win.size[0]+12;
                    droplist.size = [win.size[0]-4,group11.size[1]-3];
                    droplist.itemSize.width = droplist.size.width - 27;
                    sp.gv.refresh();
                },
            //~   the function called by window closing
            this.winClose = function(){
                    var thisStr = win.size[0].toString()+","+win.size[1].toString();
                    sp.saveSetting ("winSize",thisStr);
                    var thisStr = win.location[0].toString()+","+win.location[1].toString();
                    sp.saveSetting ("winLocation",thisStr);
                },
                this.rightClick=function(event) {
                                var alt = event.altKey;
                                var key = ScriptUI.environment.keyboardState;
                                if(alt == false && key.ctrlKey == false){
                                         keepRef.shortMenu(event);
                                     }else if (key.ctrlKey == false){
                                            keepRef.newItem(event);
                                         }else if (key.ctrlKey == true){
                                             currentPosition=[event.screenX-152,event.screenY];
                                             upAndDownWindow(currentPosition)

                                             }
                }
            //~ the function called by right clicking
            this.shortMenu = function(event){
                    if (!event) return;
                    if (event.button == 2 && event.detail == 1 && event.altKey == false) {
                    var currentPosition = [event.screenX, event.screenY];
                    var strF=$.screens[0].toString();
                    var fStr="";
                    for(var guStr=0;guStr<strF.length;guStr++){
                            if(strF[guStr+4]!="-"&&strF[guStr+4]!=":"){
                                fStr+=strF[guStr+4];
                               } else{
                                    break;
                                    }
                        }
                    if(currentPosition[0]+180>parseInt(fStr))
                        currentPosition=[event.screenX-180,event.screenY];

                    try{
                        createMenu(currentPosition);
                    }catch(err){err.printa()}
                    
                }
        }




    }//~ fns function end


    })(

//~ global 
this,

//~ create singleton helper object for script,and store it into Global
(function(){
        
    var sp = function(){
        return new sp.prototype.init();
    }

    sp.prototype = {
            
            scriptName: "Sp_memory",
            scriptVersion:"2.1",
            version: 2.1,
            slash: "/", 
            
            setting:app.settings,
            inXml:null,
            
            ui:1,
            lang:0,
                            
            ip:"139.129.132.60",
            downloadLink:"http://139.129.132.60/script/Sp_memory",
            weiboLink:"http://weibo.com/u/3893928357",
            
            
            noImage: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00d\x00\x00\x00<\b\x06\x00\x00\x00\u0090?\x1F\u00CE\x00\x00\t/IDATx\u009C\u00ED\u009BiL\x13]\x17\u00C7\u00FF\u00ED\u00B0\u00B4u\x01,QpA\u0094\u00B4\u00FAA\u0089J\t\u00A8X5b\x1E\u008D1~0\u00D1D\u00FC 1\u00A81FI\u008C\u009A(\u0089\u008D\x0B.\u0089!j\u0088\u00B2\x18\x17\u00F0\u0093Jp%\x1A\u00C5\u0088\u0080\u00DA\u00D4\x05\u0085Z!\u0080\u0082\x16D,\u00B6,-]8\u00CF\x07_&\u008E-L\u00CD\u00D3\u00F7y\u00E7\u00D5\u00F9%7\u00E9\u009C{\u00EE\u0099\u00E5?w\u00EE\u009Ds\u00A7\x12\x00\x04\x11\u00C1 \u00FD_\x1F\u0080\b\x17Q\x10\u0081!\n\"0DA\x04\u0086(\u0088\u00C0\x10\x05\x11\x18\u00A2 \x02C\x14D`\u0088\u0082\b\fQ\x10\u0081\x11\u00C4\u00E7 \u0095J1z\u00F4h\u0084\u0084\u0084x\u00D5\x11\x11\\.\x17\u00ACV+\u0088\u00FE\u00CC\f\u008CD\"\x01\x000\f\x03\u00B9\\\u008E\u00D0\u00D0PH\u00A5\u00DE\u00F7\u00B9\u00D3\u00E9\u0084\u00CDf\u00C3\u00C0\u00C0\u00C0\u00B0\u00F1x\x05\x19=z4222\x10\x17\x17\u0087\u00FE\u00FE~N\u009D\u00CB\u00E5BSS\x13\n\x0B\x0B\u00E1t:\x7F\u00E5<~+\u00A4R)\"\"\"\u0090\u0092\u0092\u0082\u00E4\u00E4d\u00C8d2N}hh(\x1A\x1B\x1BQPP\u0080o\u00DF\u00BE\r\x1B\u008BW\x10\u00B9\\\u008E\u00A4\u00A4$8\x1C\x0E\u0098L&N\u009D\u00DB\u00EDF[[\x1B\u00AF\u00EA\u00BF;\u0083O\n\u008B\u00C5\u0082\u00F7\u00EF\u00DF#44\u0094S\u00AF\u00D1h\u0090\u009C\u009C\u008C\u00E2\u00E2b^A\u0080\u00EF\u00D9\u00DE!Ktt4\x15\x15\x15\u00D1\u00FA\u00F5\u00EB\u0087\u00F5\x13\u00CB\u00D0e\u00FD\u00FA\u00F5TTTD\u00D1\u00D1\u00D1\u00BC\u00BE\u00E2\u00A0.0DA\x04\x06\u00AF \u0083\u00CFG\u00B7\u00DB\u00FDo\x1C\u00CFo\u0089\u00DB\u00ED\u0086\u00CB\u00E5\u00F2k&\u00CA+\u0088\u00D3\u00E9\u0084\u00C9dBGGG@\x0E\u00EEO\u00A4\u00A3\u00A3\x03&\u0093\u00C9\u00AF\u0099\u00A8\x04<K\u00B8\x12\u0089\x04\u00C1\u00C1\u00C1\u00F0x<\u00F0x<\u0081:\u00C6?\n\u0086a\u00C00\u008C_\u00BD\u0084W\x10\u0091\x7F\x17qP\x17\x18\u00A2 \x02C\x14D`\u00F0\u00A6N\u00FC%66\x16\x1F?~\u00F4\u009A\x1EO\u009B6\r2\u0099\f555\x1C{RR\x12\u00D2\u00D2\u00D2 \u0095JQRR\u0082\u00F2\u00F2\u00F2!cGEEA\u00ADV\u00A3\u00A2\u00A2\x02\x000n\u00DC8X\u00ADV8\x1C\x0E/\u00DFQ\u00A3F!((\b]]]^u\u0087\x0F\x1FFnn.\u00CCf\u00F3\u0090\u00FB\n\x0B\x0B\u00C3\u00F6\u00ED\u00DB1a\u00C2\x04\u00B4\u00B5\u00B5\u00E1\u00E4\u00C9\u0093\u009Ct\u00C7\u00DC\u00B9s\x11\x1E\x1E\u00CEic2\u0099\u00D0\u00DC\u00DC<d\u00CC_% \u00E9\u0081\u00A2\u00A2\"\u00BA|\u00F9\u00B2\u0097\u00BD\u00B4\u00B4\u0094***\u00D8m\u0086a\u00E8\u00C6\u008D\x1Bd\u00B7\u00DB\u00A9\u00BD\u00BD\u009D\u00CCf3\u00F5\u00F7\u00F7SEE\x05\u008D\x1C9\u00D2g\u00EC\u00EC\u00ECljmme\u00B7sss)''\u00C7\u00A7\u00EF\u00C5\u008B\x17\u00E9\u00D0\u00A1C^v\u0086a\u00A8\u00A9\u00A9\u0089\u00F2\u00F3\u00F3\u0087<\u0087={\u00F6\u0090\u00D9l&\u0087\u00C3Af\u00B3\u0099\u00FA\u00FA\u00FA\u00A8\u00A3\u00A3\u0083rssY\u009F\u00B7o\u00DF\u00D2\u00CF\\\u00BAt)`i\u0096\u0080=\u00B2\u00FA\u00FA\u00FA\u00B0j\u00D5*\u00A4\u00A7\u00A7s\u00ECn\u00B7\u009B3\u00FF\u00BEr\u00E5\n\u00B4Z-rrr\x10\x13\x13\u0083I\u0093&A\u00A7\u00D3A\u00ADV\u00E3\u00EE\u00DD\u00BBC\u00C6w\u00B9\\\u00ECo\u00A5R\u0089\u00D4\u00D4T/\x1F\u0086a0w\u00EE\\DGG{\u00D5m\u00DA\u00B4\t\u00B1\u00B1\u00B1\u00987o\u009E\u00CF\u00F8\x1B6l@VV\x16>~\u00FC\u0088\u00A5K\u0097b\u00FC\u00F8\u00F1\u00D0h4\u00D0\u00EB\u00F5\u00D8\u00B8q#\u008A\u008A\u008A\x00|\x7F/\u00BBy\u00F3&\u00B4Z-[\u00F6\u00ED\u00DB7\u00FC\u00C5\u00F9E\x02\u00A2l^^\x1E\u00D9\u00EDvjmm\u00A5\u0098\u0098\x18\u00D6~\u00F5\u00EAU\u00BA\x7F\u00FF>\x01\u00A0\u00F8\u00F8x\u00EA\u00E9\u00E9!\u009DN\u00E7\u00D5>##\u0083\u00FA\u00FA\u00FA|&1\u00B3\u00B3\u00B3\u00A9\u00A9\u00A9\u0089\u00DD.++#\u00B7\u00DBMiii\x1C\u00BF\u00CC\u00CCL\x1A\x18\x18\u00A0\u00D2\u00D2R\u00AF\x18\u00E5\u00E5\u00E5T__Ov\u00BB\u009D\u0096/_\u00CE\u00A9\u0093H$T[[K\x06\u0083\u0081\x18\u0086\u00F1j{\u00E2\u00C4\tJHH \x00TSSC\x05\x05\x05\x01\u00EB\x11?\u0097\u0080\x0E\u00EAF\u00A3\x11N\u00A7\x13W\u00AE\\a\x17n~d\u00DB\u00B6m0\u009B\u00CD8p\u00E0\u0080W]AA\x01jkk\u00B1z\u00F5j\u00DE\u00FDDFF\u00A2\u00BB\u00BB\x1B\x1B7n\u00E4\u00D8\u00D7\u00ACY\x03\u009B\u00CD\u0086\u00B0\u00B00\u008E=**\ns\u00E6\u00CC\u00C1\u00E5\u00CB\u0097a2\u0099\u00B0u\u00EBVN\u00BDV\u00AB\u0085J\u00A5\u00C2\u00A1C\u0087|\u00BE\u00FC\u00EE\u00DC\u00B9\x13\u00CF\u009F?\u00E7=\u00AE@\x10PA\\.\x17v\u00EC\u00D8\u0081\u00E9\u00D3\u00A7\u00E3\u00CC\u00993^\u00F5QQQhnn\x1Er\u00FD\u00A4\u00B1\u00B1\x11J\u00A5\u0092w?c\u00C7\u008EEyy94\x1A\r\u00E2\u00E2\u00E2\x00\x00\u0089\u0089\u0089\u0088\u008F\u008FGuu5\"##9\u00FE:\u009D\x0E\u00BD\u00BD\u00BD8v\u00EC\x18\u00AA\u00AA\u00AA\u00A0\u00D1h8\u008BH\u008B\x17/\u0086\u00C5b\u00C1\u00F5\u00EB\u00D7\u00FD:\u00CF\u00B5k\u00D7\u00E2\u00EB\u00D7\u00AFl9{\u00F6\u00AC_\u00ED\u00FC!`\u00B3\u00ACAn\u00DD\u00BA\u0085\x0B\x17. ==\u00DDkL\x18L\x1F\f\u0085\u00CB\u00E5Bpp\u00F0\u00B0\u00F1CBB\x10\x11\x11\u0081\u00E3\u00C7\u008FC\u00A5R\u00E1\u00E0\u00C1\u0083X\u00B7n\x1D\u00F6\u00EE\u00DD\x0B\u00A3\u00D1\u0088\u00ABW\u00AF\u00E2\u00C8\u0091#\u009C6\u00F3\u00E6\u00CD\u0083\u00DB\u00EDFqq1\x14\n\x05\u0094J%v\u00EF\u00DE\u00CD\u00F6\u00D4\u00C1\u00D4\u00D0\u00CFi\u008D\u00DA\u00DAZv\u00E9Z&\u0093a\u00D9\u00B2e\x00\u00BE\u00DF8eee\u00AC\u00DF\u009D;wx\u00AE\u008A\u00FF\u00FCW\u00DEC233\u00F1\u00FA\u00F5k\u009C8q\u0082s'Z,\x16L\u009E<y\u00C8v\u0093'O\u0086\u00C5b\x196vll,\u00A4R)\u00DE\u00BD{\u0087\u00BBw\u00EFb\u00C1\u0082\x05\b\x0F\x0F\u00C7\u00FC\u00F9\u00F3q\u00FD\u00FAu<y\u00F2\x04#G\u008Ed{\u00C9\u008A\x15+\u00A0R\u00A9\u00E0v\u00BB1{\u00F6lL\u009B6\r\x16\u008B\x05\x7F\u00FD\u00F5\x17\x1B\u00F3\u00F1\u00E3\u00C7\x18;v,\u00B4Z-g_\u00F7\u00EE\u00DD\u00C3\u00C3\u0087\x0F\u00D1\u00D2\u00D2\x02\u00A5R\u0089/_\u00BE\x00\x00\f\x06\x03\u00F6\u00EE\u00DD\u00CB\u0096\u00CA\u00CA\u00CA_\u00BEF\u00C3\x11\u00B0A\u00FD\u00E9\u00D3\u00A7\u00ECvTT\x14}\u00F8\u00F0\u0081\u00ACV+;\u00A8/Y\u00B2\u0084\u00ECv;m\u00DE\u00BC\u00D9\u00AB}JJ\n\u00D9l6\u00CA\u00CC\u00CC\x1CvPOOO\u00A7\u00F6\u00F6v\x02@\n\u0085\u0082>\x7F\u00FELF\u00A3\u0091ZZZ(88\u0098d2\x19uwwSjj*\x01\u00A0[\u00B7n\u00D1\u00CB\u0097/9\u00F1\u00B6l\u00D9B===\u00A4V\u00AB\t\u00F8>%\u00AE\u00AF\u00AF\u00A7G\u008F\x1E\u00F9<\u00B7\u0092\u0092\x12\u00AA\u00AB\u00AB\u00FB\u00FF\x1B\u00D4\x7F\u00A4\u00BD\u00BD\x1D\u00BBv\u00ED\u00E2\u00D8\x1E<x\x00\u0083\u00C1\x00\u009DN\u0087\u00B4\u00B44\u00D6\u00BEh\u00D1\"\u009C?\x7F\x1E\u00EF\u00DF\u00BF\u00C7\u00A9S\u00A7\u0086\u008D;c\u00C6\f\u00F6N\u00ED\u00EB\u00EBCee%T*\x15***\u00E0r\u00B9\u00E0p8`\u00B1X\u00A0\u00D1h\u00A0P(\u0090\u0090\u0090\u0080\u00AA\u00AA*N\u008C\u00FC\u00FC|\u00B4\u00B5\u00B5\u00B1\u00D3U\u008F\u00C7\u0083s\u00E7\u00CE!11\x11\u00A5\u00A5\u00A5\u0090\u00CB\u00E5\u00AC\u00EF\u00FE\u00FD\u00FB\u0091\u009A\u009A\u008A\u00DB\u00B7o\u00B3\u00B6\u0090\u0090\x10\u0084\u0087\u0087\u00B3\u00E5\u00E75\u00F4\x7FJ@\u0094\u00CD\u00CF\u00CF'\u00BD^\u00EF\u00D3\u00FEc\u00CF\u0089\u0088\u0088 \u00BD^O\x0E\u0087\u0083\u00DE\u00BCyC\u00AF^\u00BD\u00A2\u00DE\u00DE^\u00AA\u00AB\u00AB#\u0095J\u00E53vvv6577\x13\x00*..\u00E6\u00BCh\u00CE\u009A5\u008B\u00ACV+M\u009D:\u0095\u00B5\u00BDx\u00F1\u0082\n\x0B\x0B\u00E9\u00F0\u00E1\u00C3\u00D4\u00D5\u00D5Ec\u00C6\u008C\u00F1\u008AY\\\\L\r\r\r$\u0091HX\u00DB\u00E9\u00D3\u00A7\u00C9j\u00B5\u00D2\u00A7O\u009F\u00E8\u00C9\u0093'd4\x1A\u00C9n\u00B7\u00D3\u008D\x1B7X\u00BF7o\u00DEPww7uuu\u00B1%///`=\u0084\x01\u00A0\x0B\u0084\u00AA===\u00F8\u00F0\u00E1\u0083\u00D7\u00F4\u00F0\u00F6\u00ED\u00DB\u00E8\u00EC\u00ECd\u00BFXq8\x1C(,,\u0084\u00CDf\u0083B\u00A1@WW\x17JJJ\u0090\u0096\u0096\u0086\u00CE\u00CEN\u009F\u00B1\x07g3\u00D5\u00D5\u00D5\x18\x18\x18\u00C0\u00F3\u00E7\u00CFQWW\x07\u00E0{Olhh@uu5\u00EB\u00DF\u00DF\u00DF\u008Fg\u00CF\u009E\u00A1\u00B3\u00B3\x13\u00D5\u00D5\u00D5>\u009F\u00F1\x06\u0083\x012\u0099\fz\u00BD\u009E}q-++\u00C3\u00BD{\u00F7\u00A0T*\u00E1v\u00BB\u00D1\u00DA\u00DA\u008A\u00A3G\u008F\"++\u008Bm\x17\x14\x14\x04\u00A3\u00D1\b\u0083\u00C1\u00C0\u0096k\u00D7\u00AE\u00A1\u00A5\u00A5\u00E5\u009F]\u00C0\u00FF \u00AE\u0087\b\f1\u00DB+0DA\x04\x06\u00AF \x12\u0089\x04\f\u00C3\u00F8\u00FC^U\u00C4?\u00A4R)\x18\u0086\u00F1\u0099N\u00F2\u00F2\u00E5s`\x18\x06\u0091\u0091\u0091\x181bD@\x0E\u00EEOd\u00C4\u0088\x11\u0088\u008C\u008C\x04\u00C30\u00BC\u00BE\u00BC\u0082(\x14\n\u00A4\u00A6\u00A6B\u00ADV\x07\u00E4\u00E0\u00FED\u00D4j5\u0096.]\n\u0085B\u00C1\u00EB\u00CB+\u0088\\.\u00C7\u00C2\u0085\x0B\u00D9$\u009E\u00C8\u00AF\x13\x17\x17\x07\u00ADV\u00CBy\u00E1\x1C\n^A\u00A4R)\u00E4r\u00B9\u00CF\u00FF\u0087\u0088\u00F8GHH\b\u00E4r\u00B9_\u00E3\u00B08R\x0B\fQ\x10\u0081\u00E1\u00D7z\u0088B\u00A1\u00C0\u00CA\u0095+1q\u00E2D\u008E}0\u00BDPRR2\u00EC:\u00C7\u00EF\u008ET*EXX\x18\x12\x12\x120s\u00E6L\u00AFd\u00E3\u00EC\u00D9\u00B3\x11\x14\u00E4\u00DF\u00D2\x13\u00AF\u0097\u00DDn\u00C7\u00B3g\u00CF0}\u00FAt\u00AF\u0081\u00DD\u00E9t\u00C2\u00E3\u00F1\u00F85\u00BF\u00FE]\u0091H$\u00EC\u00F7\u00CFJ\u00A5\x12S\u00A6L\u00F1\x1A\u00BC{{{a2\u0099`\u00B7\u00DB\u00F9\u00E3\u0081'\u0097%\u00FE\u00E9sx\x02\u00FD\u00A7O1\u00B9(0\u00C4A]`\u0088\u0082\b\fQ\x10\u0081!\n\"0DA\x04\u0086(\u0088\u00C0\x10\x05\x11\x18\u00A2 \x02C\x14D`\u0088\u0082\b\u008C\u00BF\x01O\u00C5\u0098\x01\u00ABf\u00E6Y\x00\x00\x00\x00IEND\u00AEB`\u0082",
            
            xmlFileNames : [],
            
            lastSetProp : [],
            lastSetPropValue : [],
            
            lastLayer: [],
            lastLayerIndex: [],
            
            lastExpProp: [],
            lastExp:[],
            
            init: function(){
                    return this;
                },
            
            //~            give source to target
            extend: function (target, source) {
                for (var i in source) target[i] = source[i];
                return target;
            },

    },


    //~     added in 2016.1.20
    sp.prototype.extend(sp.prototype,{
        
                   
            scriptFile: new File($.fileName),
            scriptFolder: new Folder(File($.fileName).parent.fsName +sp.prototype.slash +  "Sp_memory"),
            materialFolder: new Folder(File($.fileName).parent.fsName +sp.prototype.slash +  "tempFile"),
            settingsFile: new File(File($.fileName).parent.fsName + sp.prototype.slash +  "Sp_memory"+ sp.prototype.slash + "settings.xml"),
            imageFolder: new Folder(File($.fileName).parent.fsName + sp.prototype.slash +  "Sp_memory"+ sp.prototype.slash + "image"),
            roamingFolder:new  Folder(Folder.userData.fullName + "/Aescripts/Sp_memory"),
            
        
            haveSetting: function(keyName){
                    return this.setting.haveSetting (this.scriptName, keyName);
                },
            
            saveSetting: function( keyName, value){
                    this.setting.saveSetting (this.scriptName, keyName, value);
            },
        
            getSetting: function(keyName){
                    return this.setting.getSetting (this.scriptName, keyName);
            },
      
            getSettingAsBool: function(keyName){
                    return this.getSetting(keyName) === "true"? true : false;
            },
            
            getFileByName: function(name){
                var string = this.scriptFolder.toString() +this.slash+ name + ".xml";
                var file = new File(string);
                return file;
            },
        
            getImageFolderByName: function(name){
                var string = this.imageFolder.toString() + this.slash + name + "";
                var folder = new Folder(string);
                if(!folder.exists)
                    folder.create();
                return folder;
            },
        
            getImage: function(groupName,imageName){
                    var folder = this.getImageFolderByName(groupName);
                    if(!folder.exists) 
                        folder.create();
                    var string = folder.toString()+ this.slash + imageName+ ".png";
                    var file = new File(string);
                    if(file.exists)
                        return file;
                    else
                        return this.noImage;
            },
            
            getImageFile: function(groupName,imageName){
                    var folder = this.getImageFolderByName(groupName);
                    if(!folder.exists) 
                        folder.create();
                    var string = folder.toString()+ this.slash + imageName+ ".png";
                    var file = new File(string);
                    return file;
            },
        
            getDistance: function (a, b) {
                return parseInt((a.toString().substring(0, 2) - b.toString().substring(0, 2))) * 100 + parseInt(b);
            },
        
            openLink: function(url) {
                    var cmd = "";
                    if ($.os.indexOf("Win") != -1) {
                        cmd += "explorer " + url;
                    } else {
                        cmd += "open \"" + url + "\"";
                    }
                    try {
                        system.callSystem(cmd);
                    } catch (e) {}
            },
        
            getVersion: function(scriptname){ 
                           var url = this.ip+"/script/"+scriptname+".txt"; 
                           
                           var port=80;
                           var domain=url.split("/")[0]+":"+port;
                           var fileName=url.substr(url.lastIndexOf("/")+1);
                           var call="GET ";
                           if(url.indexOf("/")<0){
                              call+="/";
                           }else{
                              call+=url.substr(url.indexOf("/"));
                           }
                           call+=" HTTP/1.1\n";
                           call+="Host: "+domain+"\n\n";
                           call+="Connection: close\n\n";

                           var reply = new String();
                           var file = new File();
                           file.encoding = "binary";
                           file.open("w");
                           var conn = new Socket();
                           conn.encoding = "binary";
                           if (conn.open (domain, "binary")) {
                               conn.write (call);
                        reply = conn.read(300);
                        var contentLengthHeader = String(reply.match(/Content-Length: [0-9]*/));
                        var contentLength = contentLengthHeader.substr (16);
                        var headerLength = reply.indexOf("\n\n")+2;
                        reply += conn.read(contentLength + headerLength - 300);  
                        var recievedVersion = reply.toString().substring(reply.toString().lastIndexOf("BeginVersion")+12,reply.toString().lastIndexOf("EndVersion"));
                        conn.close();
                           }else{
                              reply = "";
                           }

                          return recievedVersion; 
                        },

        })
    
        //~  added in 2016.1.21
        sp.prototype.extend(sp.prototype,{
                    swap: function(a, b) {
                        tempA = a.text;
                        a.text = b.text;
                        b.text = tempA;
                    },
                    lookUpTextInChildren:function(text,children){
                            var len = children.length;
                            for(var i=0;i<len;i++){
                                    if(children[i].text===text)
                                        return true;
                                }
                            return false;
                        },
                  
                    lookUpInArray:function(text,arr){
                            var len = arr.length
                            for(var i=0;i<len;i++){
                                    if(arr[i]===text)
                                        return true;
                                }
                            return false;
                        },
                    reloadDroplist: function(){
                                  this.droplist.removeAll();
                                  var settingxml = new XML(this.settingsFile.readd());
                                  this.xmlFileNames.length = 0;
                                  this.forEach(settingxml.ListItems,function(item,index){
                                               this.push(item.toString ());
                                      },this.xmlFileNames);
                                  this.xmlFileNames.forEach(function(item,index){
                                          this.add("item",item);
                                      },this.droplist)
                              },
                    cropImage :function (fi, inImageFileA) {
                              var f = new ImportOptions();
                              f.file = fi;
                              f.forceAlphabetical = false;
                              f.importAs = ImportAsType.FOOTAGE;
                              f.sequence = false;
                              var f = app.project.importFile(f);
                              var tempComp3 = app.project.items.addComp("tempComp", 100, 60, 1, 5, 30);
                              var BGtemp3 = tempComp3.layers.addSolid([0, 0, 0], "BG", tempComp3.width, tempComp3.height, 1, 10800);
                              var ima = tempComp3.layers.add(f);
                              var scaleX = 10000 / ima.source.width;
                              var scaleY = 6000 / ima.source.height;
                              if (scaleX / 60 < scaleY / 100) 
                                  ima.transform.scale.setValue([scaleX, scaleX]);
                               else 
                                  ima.transform.scale.setValue([scaleY, scaleY]);
                              tempComp3.saveFrameToPng(0, inImageFileA);
                              f.remove();
                              try {
                                  if (BGtemp3.source.parentFolder.numItems == 1) {
                                      BGparent = BGtemp3.source.parentFolder;
                                      BGtemp3.source.remove();
                                      BGparent.remove();
                                  } else {
                                      BGtemp3.source.remove();
                                  }
                              } catch (err) { }
                              tempComp3.remove();
                        },
    
                  savePng:function (pngPath) {
                              try{
                                      app.beginSuppressDialogs();
                                      var comps = app.project.activeItem;
                                      var layers = comps.selectedLayers;
                                      var inArr = [];
                                      for(var i=0;i<layers.length;i++){
                                              inArr.push(layers[i].index);
                                          }
                                      var otherIndexArr = [];
                                      var otherEnabledArr = [];
                                      for(var i=0;i<comps.numLayers;i++){
                                             var thisLayer= comps.layer(i+1);
                                             if(inArr.toString().indexOf (thisLayer.index)==-1){
                                                      otherEnabledArr.push(thisLayer.enabled);
                                                      otherIndexArr.push(thisLayer.index);
                                                      try{
                                                          thisLayer.enabled = false;
                                                      }catch(err){}
                                                 }
                                          }
                                      var nameStr = "";
                                      pngPath = File(pngPath);
                                      while (pngPath.exists) {
                                          pngPath = pngPath.toString().split(".")[0].toString() + "_" + ".png";
                                          pngPath = File(pngPath);
                                      }
                                      try{
                                          if(app.settings.getSetting("Sp_memory", "thumbType")=="true"){
                                              app.activeViewer.views[0].saveBlittedImageToPng(comps.time,pngPath,1000,"what's this? I don't know");
                                          }else{
                                              comps.saveFrameToPng (comps.time, pngPath);
                                              }
                                          }catch(err){alert(err.line.toString()+ err.toString())}
                                          for(var i=0;i<otherIndexArr.length;i++){
                                              try{
                                                 var thisLayer= comps.layer(otherIndexArr[i]);
                                                 thisLayer.enabled = otherEnabledArr[i];
                                                 }catch(err){}
                                          }
                                          this.cropImage (pngPath, pngPath);
                                          app.endSuppressDialogs(false);    
                                                  nameStr = decodeURIComponent(File(pngPath).displayName.split(".")[0].toString());
                                                  return encodeURIComponent(nameStr);
                                          }catch(err){alert(err.line.toString()+ err.toString())}
                              },
                
            });

    sp.prototype.init.prototype = sp.prototype;
    $.global.sp = sp();
    return $.global.sp;
})(),


//~ add method to objects
(function(sp){
      
            //~   getter/setter for  last  element of array
            Array.prototype.last = function(value){
                        if(typeof value === "undefined")
                              return this[this.length-1];
                        else
                              this[this.length-1] = value;
                  }
            
            //~     add array.forEach()
             Array.prototype.forEach = function(callback, context) {
                if (Object.prototype.toString.call(this) === "[object Array]") {
                    var i,
                        len;
                    for (i = 0, len = this.length; i < len; i++) {
                        if (typeof callback === "function"  && Object.prototype.hasOwnProperty.call(this, i)) {
                            if (callback.call(context, this[i], i, this) === false) {
                                break; // or return;
                            }
                        }
                    }
                }
             }
         
       sp.extend(sp,{
           forEach:function(xml,callback,context){
            if(!(xml instanceof XML)) return;
            var i,
                len;
                for(i=0,len = xml.children().length();i<len;i++){
                        if(callback.call(context,xml.child(i),i,xml) ===false){
                                break;
                            }
                    }
            }
        });

        Error.prototype.print =Error.prototype.print|| function(){
                return "Line #"+this.line.toString()+"\r\n"+this.toString();
            }

        Error.prototype.printc = Error.prototype.printc||function(){
                $.writeln("\n---------");
                $.writeln(this.print());
                $.writeln("---------\n");
            }

        Error.prototype.printa = Error.prototype.printa ||function(){
                alert(this.print());
            }

        File.prototype.writee = function (str) {    //method to write file
            this.open("w");
            this.write(str);
            this.close();
        }
        File.prototype.readd = function(){      //method to read from file
                this.open("r");
                var temp = this.read();
                this.close();
                return temp;
            }
        Array.prototype.pushh = function(str){  //chains call for Array.push()
                this.push(str);
                return this;
            }
    
})(sp),

//~ save presets and load presets file and parse them
(function(sp){

    var keyName = [];
    var valueArr = [];
    
        for (var i = 1; i<= 9; i++) {
                keyName.push( "_1_" + i);
                if (i == 1 || i == 2 || i == 5) {
                    valueArr.push("1");
                } else {
                    valueArr.push("0");
                }
            }        
        
        for (var i = 1;i <= 9; i++) {
                keyName.push( "_2_" + i);
                valueArr.push("0");
            }
        
    keyName.pushh("thisSelection")
                 .pushh("limitText")
                 .pushh("thumbType")
                 .pushh("winLocation")
                 .pushh("winSize")
                 .pushh("coverChange")
                 .pushh("folderName")
                 .pushh("effectName")
                 .pushh("deleteAlert")
                 .pushh("preCompose")
                 .pushh("saveMaterial")
                 .pushh("autoName")
                 .pushh("onlyEffect")
                 .pushh("cleanGroup")   
                 .pushh("offsetKeyframe")   
                 .pushh("language")
                 .pushh("showThumb")
                 
    valueArr.pushh(1)
                .pushh("true")
                .pushh("false")
                .pushh("200,500") 
                .pushh("300,500")  
                .pushh("false")
                .pushh("Sp_memory Folder")
                .pushh("Effects,Effect,effect,effects,特效,效果")
                .pushh("true")
                .pushh("false")
                .pushh("true")
                .pushh("true")
                .pushh("false")
                .pushh("false")
                .pushh("false")
                .pushh("ch")
                .pushh("true")

    keyName.forEach (function(item, index){
            function(item, value){
                if(sp.haveSetting (item)==false)
                    sp.saveSetting (item, value);
            }(item,valueArr[index])
        });
    
      sp.showThumbValue = sp.getSettingAsBool("showThumb");
      sp.deleteAlertValue = sp.getSettingAsBool ("deleteAlert");
      sp.preComposeValue = sp.getSettingAsBool ("preCompose");
      sp.saveMaterialValue = sp.getSettingAsBool ("saveMaterial");
      sp.autoNameValue = sp.getSettingAsBool ("autoName");
      sp.onlyEffectValue = sp.getSettingAsBool ("onlyEffect");
      sp.cleanGroupValue = sp.getSettingAsBool("cleanGroup");
      sp.offsetKeyframeValue = sp.getSettingAsBool ("offsetKeyframe");
      
    
      !sp.roamingFolder.exists && sp.roamingFolder.create();
      !sp.materialFolder.exists && sp.materialFolder.create();
       
     var loc = function(string){
            if(sp.lang === 0)
                    sp.lang = sp.getSetting ("language");
            return string[sp.lang];
         }
     
     $.global.loc = loc;

        sp.extend(sp,{
                beyondCS6: true,
                versionUpdateInfo:{
                        ch: "测试",
                        en: "test"
                    },
            });
    
       if (sp.haveSetting("version") == false) {
            alert(loc(sp.versionUpdateInfo));
            sp.saveSetting("version", sp.version);
        }else{
                if(sp.getSetting("version")<sp.version){
                        alert(loc(sp.versionUpdateInfo));
                        sp.saveSetting("version", sp.version);
                    }
            }
        
        

    
    
    if (!(sp.settingsFile.exists)||sp.settingsFile.length==0) {
        if(sp.settingsFile.exists) sp.settingsFile.remove();
        var settingsText =
            "<settings>\
    <Show>1</Show>\
    <Alert>1</Alert>\
    <Precomp>0</Precomp>\
    <Fix>0</Fix>\
    <AutoName>1</AutoName>\
    <OnlyEffect>0</OnlyEffect>\
    <Selection>0</Selection>\
    <SubItems>0</SubItems>\
    <ListItems/>\
</settings>";
        var newsettingsxml = new XML(settingsText);
        var allFiles = sp.scriptFolder.getFiles();
        var xmlFinalArr = [];
        allFiles.forEach(function(item,index){
                if(item.toString().indexOf(".xml")!=-1){
                        sp.xmlFileNames.push(item.displayName.replace(".xml",""));
                        newsettingsxml.ListItems.appendChild(XML("<Name>" + item.displayName.replace(".xml","") + "</Name>"))
                    }
            })
        sp.settingsFile.writee(newsettingsxml);
    }



    
    })(sp),

//~  Layer object to handle with layers of after effects, for saving and generating
(function(){
    
    $.layer = function(item){
        return new $.layer.prototype.init(item);
    }

    $.layer.prototype = {
            init: function(layer){
                   this.item = item;
                
                    return this;
                },
    }


    //~  convert Layer object to XML or JSON
    sp.extend($.layer.prototype,{
        
        isSaveMaterial: true,
        
        //~         return the attributes of layer
        getLayerAttr: function(){
                var layer = this.getLayer();
            },
      
        getCompLayerAttr: function(){
              
              },
        
        getMaterial: function(){
              
              },
        
        
        //~         return every property under the layer  
        getProperties: function(){
            
             },
      
        recursiveScanLayer: function(){
              
              },
        
        addToLastChild: function(){
              
              },
      
        getProperty: function(){
              
              },
        
        
        //~         get the xml-based data of layer
        toXML: function(){
            
            },
        
        //~         get the json-based data of layer
        toJSON: function(){
            
            },
      
        

        })
  
    //~ convert XML object to Layer object
    sp.extend($.layer.prototype,{
          materialFolder:     sp.materialFolder,
          isPrecompose :     true,
          isOnlyEffect:         false,
          isCleanGroup:       false,
          isKeyframeOffset:  false,
          
          newLayer: function(){
                
                },
          
          newComp: function(){
                
                },
          
          newMaterial: function(){
                
                },
          
          findCompOrMaterial: function(){
                
                },
          
          setLayerAttr: function(){
                
                },
          
          setCompLayerAttr: function(){
                
                },
          
          setProperties: function(){
                
                },
          
          setProperty: function(){
                
                },
          
          cleanProperty: function(){
                
                },
          
          toLayer: function(){
                
                }
          
          
          })

    $.layer.prototype.init.prototype = $.layer.prototype;
    $.global._layer = $.layer;
    return $.layer;
    
})(),




)



}catch(err){err.printa();err.printc()}





