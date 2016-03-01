/*! Fabrik */
var FbForm;FbForm=new Class({Implements:[Options,Events],options:{rowid:"",admin:!1,ajax:!1,primaryKey:null,error:"",submitOnEnter:!1,updatedMsg:"Form saved",pages:[],start_page:0,ajaxValidation:!1,showLoader:!1,customJsAction:"",plugins:[],ajaxmethod:"post",inlineMessage:!0,print:!1,toggleSubmit:!1,mustValidate:!1,lang:!1,debounceDelay:500,images:{alert:"",action_check:"",ajax_loader:""}},initialize:function(a,b){"null"===typeOf(b.rowid)&&(b.rowid=""),this.id=a,this.result=!0,this.setOptions(b),this.plugins=this.options.plugins,this.options.pages=$H(this.options.pages),this.subGroups=$H({}),this.currentPage=this.options.start_page,this.formElements=$H({}),this.hasErrors=$H({}),this.mustValidateEls=$H({}),this.elements=this.formElements,this.duplicatedGroups=$H({}),this.addingOrDeletingGroup=!1,this.fx={},this.fx.elements=[],this.fx.validations={},this.setUpAll(),this._setMozBoxWidths(),function(){this.duplicateGroupsToMin()}.bind(this).delay(1e3),this.events={},this.submitBroker=new FbFormSubmit,Fabrik.fireEvent("fabrik.form.loaded",[this])},_setMozBoxWidths:function(){Browser.firefox&&this.getForm()&&this.getForm().getElements(".fabrikElementContainer > .displayBox").each(function(a){var b=a.getParent().getComputedSize(),c=a.getParent().getSize().x-(b.computedLeft+b.computedRight),d=0===a.getParent().getSize().x?400:c;a.setStyle("width",d+"px");var e=a.getElement(".fabrikElement");"null"!==typeOf(e)&&(c=0,a.getChildren().each(function(a){a!==e&&(c+=a.getSize().x)}),e.setStyle("width",d-c-10+"px"))})},setUpAll:function(){this.setUp(),this.winScroller=new Fx.Scroll(window),this.form&&((this.options.ajax||this.options.submitOnEnter===!1)&&this.stopEnterSubmitting(),this.watchAddOptions()),$H(this.options.hiddenGroup).each(function(a,b){if(a===!0&&"null"!==typeOf(document.id("group"+b))){var c=document.id("group"+b).getElement(".fabrikSubGroup");this.subGroups.set(b,c.cloneWithIds()),this.hideLastGroup(b,c)}}.bind(this)),this.repeatGroupMarkers=$H({}),this.form&&(this.form.getElements(".fabrikGroup").each(function(a){var b=a.id.replace("group",""),c=a.getElements(".fabrikSubGroup").length;1===c&&"none"===a.getElement(".fabrikSubGroupElements").getStyle("display")&&(c=0),this.repeatGroupMarkers.set(b,c)}.bind(this)),this.watchGoBackButton()),this.watchPrintButton(),this.watchPdfButton(),this.watchTabs()},watchPrintButton:function(){this.form.getElements("a[data-fabrik-print]").addEvent("click",function(a){if(a.stop(),this.options.print)window.print();else{var b="index.php?option=com_"+Fabrik["package"]+"&view=details&tmpl=component&formid="+this.id+"&listid="+this.options.listid+"&rowid="+this.options.rowid+"&iframe=1&print=1";this.options.lang!==!1&&(b+="&lang="+this.options.lang),window.open(b,"win2","status=no,toolbar=no,scrollbars=yes,titlebar=no,menubar=no,resizable=yes,width=400,height=350,directories=no,location=no;")}}.bind(this))},watchPdfButton:function(){this.form.getElements('*[data-role="open-form-pdf"]').addEvent("click",function(a){a.stop();var b=a.event.currentTarget.href.replace(/(rowid=\d*)/,"rowid="+this.options.rowid);this.options.lang!==!1&&(b+="&lang="+this.options.lang),window.location=b}.bind(this))},watchGoBackButton:function(){if(this.options.ajax){var a=this._getButton("Goback");if("null"===typeOf(a))return;a.addEvent("click",function(a){a.stop(),Fabrik.Windows[this.options.fabrik_window_id]?Fabrik.Windows[this.options.fabrik_window_id].close():window.history.back()}.bind(this))}},watchAddOptions:function(){this.fx.addOptions=[],this.getForm().getElements(".addoption").each(function(a){var b=a.getParent(".fabrikElementContainer").getElement(".toggle-addoption"),c=new Fx.Slide(a,{duration:500});c.hide(),b.addEvent("click",function(a){a.stop(),c.toggle()})})},setUp:function(){this.form=this.getForm(),this.watchGroupButtons(),this.watchSubmit(),this.createPages(),this.watchClearSession()},getForm:function(){return"null"===typeOf(this.form)&&(this.form=document.id(this.getBlock())),this.form},getBlock:function(){return"null"===typeOf(this.block)&&(this.block=this.options.editable===!0?"form_"+this.id:"details_"+this.id,""!==this.options.rowid&&(this.block+="_"+this.options.rowid)),this.block},addElementFX:function(a,b){var c,d,e;if(a=a.replace("fabrik_trigger_",""),"group_"===a.slice(0,6)){if(a=a.slice(6,a.length),d=a,c=document.id(a),!c)return fconsole('Fabrik form::addElementFX: Group "'+a+'" does not exist.'),!1}else{if("element_"!==a.slice(0,8))return fconsole("Fabrik form::addElementFX: Not an element or group: "+a),!1;if(a=a.slice(8,a.length),d="element"+a,c=document.id(a),!c)return fconsole('Fabrik form::addElementFX: Element "'+a+'" does not exist.'),!1;if(c=c.getParent(".fabrikElementContainer"),!c)return fconsole('Fabrik form::addElementFX: Element "'+a+'.fabrikElementContainer" does not exist.'),!1}if(c){var f=c.get("tag");"li"===f||"td"===f?(e=new Element("div",{style:"width:100%"}).adopt(c.getChildren()),c.empty(),e.inject(c)):e=c;var g={duration:800,transition:Fx.Transitions.Sine.easeInOut};return"null"===typeOf(this.fx.elements[d])&&(this.fx.elements[d]={}),this.fx.elements[d].css=new Fx.Morph(e,g),"null"===typeOf(e)||"slide in"!==b&&"slide out"!==b&&"slide toggle"!==b||(this.fx.elements[d].slide=new Fx.Slide(e,g)),this.fx.elements[d]}return!1},doElementFX:function(a,b,c){var d,e,f,g,h=this.formElements.get(a.replace("fabrik_trigger_element_","")),i=!0;if(h&&(i=h.options.inRepeatGroup),c&&i&&c.options.inRepeatGroup){var j=a.split("_");j[j.length-1]=c.options.repeatCounter,a=j.join("_")}if(a=a.replace("fabrik_trigger_",""),"group_"===a.slice(0,6)?(a=a.slice(6,a.length),"group_"===a.slice(0,6)&&(a=a.slice(6,a.length)),d=a,e=!0):(e=!1,a=a.slice(8,a.length),d="element"+a),f=this.fx.elements[d],f||(f=this.addElementFX("element_"+a,b))){switch(g=e||f.css.element.hasClass("fabrikElementContainer")?f.css.element:f.css.element.getParent(".fabrikElementContainer"),"td"===g.get("tag")&&(g=g.getChildren()[0]),b){case"show":g.fade("show").removeClass("fabrikHide"),e&&document.id(a).getElements(".fabrikinput").setStyle("opacity","1");break;case"hide":g.fade("hide").addClass("fabrikHide");break;case"fadein":g.removeClass("fabrikHide"),"fadein"!==f.css.lastMethod&&(f.css.element.show(),f.css.start({opacity:[0,1]}));break;case"fadeout":"fadeout"!==f.css.lastMethod&&f.css.start({opacity:[1,0]}).chain(function(){f.css.element.hide(),g.addClass("fabrikHide")});break;case"slide in":f.slide.slideIn();break;case"slide out":f.slide.slideOut(),g.removeClass("fabrikHide");break;case"slide toggle":f.slide.toggle();break;case"clear":this.formElements.get(a).clear();break;case"disable":e||jQuery("#"+a).prop("disabled",!0);break;case"enable":e||jQuery("#"+a).prop("disabled",!1);break;case"readonly":e||("SELECT"===jQuery("#"+a).prop("tagName")?jQuery("#"+a+" option:not(:selected)").attr("disabled",!0):jQuery("#"+a).prop("readonly",!0));break;case"notreadonly":e||("SELECT"===jQuery("#"+a).prop("tagName")?jQuery("#"+a+" option").attr("disabled",!1):jQuery("#"+a).prop("readonly",!1))}f.lastMethod=b,Fabrik.fireEvent("fabrik.form.doelementfx",[this])}},getGroupTab:function(a){if(document.id("group"+a).getParent().hasClass("tab-pane")){var b=document.id("group"+a).getParent().id,c=this.form.getElement("a[href=#"+b+"]");return c.getParent()}return!1},hideGroupTab:function(a){var b=this.getGroupTab(a);b!==!1&&(b.hide(),b.hasClass("active")&&(b.getPrevious()?jQuery(b.getPrevious().getFirst()).tab("show"):b.getNext()&&jQuery(b.getNext().getFirst()).tab("show")))},selectGroupTab:function(a){var b=this.getGroupTab(a);b!==!1&&(b.hasClass("active")||jQuery(b.getFirst()).tab("show"))},showGroupTab:function(a){var b=this.getGroupTab(a);b!==!1&&b.show()},watchTabs:function(){var a=this;jQuery(this.form).on("click","*[data-role=fabrik_tab]",function(b){var c=b.target.id.match(/group(\d+)_tab/);c.length>1&&(c=c[1]),Fabrik.fireEvent("fabrik.form.tab.click",[a,c,b],500)})},watchClearSession:function(){this.form&&this.form.getElement(".clearSession")&&this.form.getElement(".clearSession").addEvent("click",function(a){a.stop(),this.form.getElement("input[name=task]").value="removeSession",this.clearForm(),this.form.submit()}.bind(this))},createPages:function(){var a,b,c,d;this.isMultiPage()&&(this.options.pages.each(function(a,e){if(b=new Element("div",{"class":"page",id:"page_"+e}),c=document.id("group"+a[0]),"null"!==typeOf(c)){if(d=c.getParent("div"),"null"===typeOf(d)||d.hasClass("tab-pane"))return;b.inject(c,"before"),a.each(function(a){b.adopt(document.id("group"+a))})}}),a=this._getButton("Submit"),a&&""===this.options.rowid&&(a.disabled="disabled",a.setStyle("opacity",.5)),"null"!==typeOf(document.getElement(".fabrikPagePrevious"))&&(this.form.getElement(".fabrikPagePrevious").disabled="disabled",this.form.getElement(".fabrikPagePrevious").addEvent("click",function(a){this._doPageNav(a,-1)}.bind(this))),"null"!==typeOf(document.getElement(".fabrikPagePrevious"))&&this.form.getElement(".fabrikPageNext").addEvent("click",function(a){this._doPageNav(a,1)}.bind(this)),this.setPageButtons(),this.hideOtherPages())},isMultiPage:function(){return this.options.pages.getKeys().length>1},_doPageNav:function(a,b){if(this.options.editable){this.form.getElement(".fabrikMainError").addClass("fabrikHide"),"null"!==typeOf(document.getElement(".tool-tip"))&&document.getElement(".tool-tip").setStyle("top",0);var c="index.php?option=com_fabrik&format=raw&task=form.ajax_validate&form_id="+this.id;this.options.lang!==!1&&(c+="&lang="+this.options.lang),Fabrik.loader.start(this.getBlock(),Joomla.JText._("COM_FABRIK_VALIDATING"));var d=(this.options.pages.get(this.currentPage.toInt()),$H(this.getFormData()));d.set("task","form.ajax_validate"),d.set("fabrik_ajax","1"),d.set("format","raw"),d=this._prepareRepeatsForAjax(d);{new Request({url:c,method:this.options.ajaxmethod,data:d,onComplete:function(a){Fabrik.loader.stop(this.getBlock()),a=JSON.decode(a),(-1===b||this._showGroupError(a,d)===!1)&&(this.changePage(b),this.saveGroupsToDb()),new Fx.Scroll(window).toElement(this.form)}.bind(this)}).send()}}else this.changePage(b);a.stop()},saveGroupsToDb:function(){if(0!==this.options.multipage_save){if(Fabrik.fireEvent("fabrik.form.groups.save.start",[this]),this.result===!1)return void(this.result=!0);var a=this.form.getElement("input[name=format]").value,b=this.form.getElement("input[name=task]").value;this.form.getElement("input[name=format]").value="raw",this.form.getElement("input[name=task]").value="form.savepage";var c="index.php?option=com_fabrik&format=raw&page="+this.currentPage;this.options.lang!==!1&&(c+="&lang="+this.options.lang),Fabrik.loader.start(this.getBlock(),"saving page");var d=this.getFormData();d.fabrik_ajax=1,new Request({url:c,method:this.options.ajaxmethod,data:d,onComplete:function(c){return Fabrik.fireEvent("fabrik.form.groups.save.completed",[this]),this.result===!1?void(this.result=!0):(this.form.getElement("input[name=format]").value=a,this.form.getElement("input[name=task]").value=b,this.options.ajax&&Fabrik.fireEvent("fabrik.form.groups.save.end",[this,c]),void Fabrik.loader.stop(this.getBlock()))}.bind(this)}).send()}},changePage:function(a){return this.changePageDir=a,Fabrik.fireEvent("fabrik.form.page.change",[this,a]),this.result===!1?void(this.result=!0):(this.currentPage=this.currentPage.toInt(),this.currentPage+a>=0&&this.currentPage+a<this.options.pages.getKeys().length&&(this.currentPage=this.currentPage+a,this.pageGroupsVisible()||this.changePage(a)),this.setPageButtons(),document.id("page_"+this.currentPage).setStyle("display",""),this._setMozBoxWidths(),this.hideOtherPages(),Fabrik.fireEvent("fabrik.form.page.chage.end",[this,a]),Fabrik.fireEvent("fabrik.form.page.change.end",[this,a]),this.result===!1?void(this.result=!0):void 0)},pageGroupsVisible:function(){var a=!1;return this.options.pages.get(this.currentPage).each(function(b){var c=document.id("group"+b);"null"!==typeOf(c)&&"none"!==c.getStyle("display")&&(a=!0)}),a},hideOtherPages:function(){var a,b=parseInt(this.currentPage,10);this.options.pages.each(function(c,d){parseInt(d,10)!==b&&(a=jQuery("#page_"+d),a.hide())})},setPageButtons:function(){var a=this._getButton("Submit"),b=this.form.getElement(".fabrikPagePrevious"),c=this.form.getElement(".fabrikPageNext");"null"!==typeOf(c)&&(this.currentPage===this.options.pages.getKeys().length-1?("null"!==typeOf(a)&&(a.disabled="",a.setStyle("opacity",1)),c.disabled="disabled",c.setStyle("opacity",.5)):("null"===typeOf(a)||""!==this.options.rowid&&"0"!==this.options.rowid.toString()||(a.disabled="disabled",a.setStyle("opacity",.5)),c.disabled="",c.setStyle("opacity",1))),"null"!==typeOf(b)&&(0===this.currentPage?(b.disabled="disabled",b.setStyle("opacity",.5)):(b.disabled="",b.setStyle("opacity",1)))},destroyElements:function(){this.formElements.each(function(a){a.destroy()})},addElements:function(a){var b=[],c=0;for(a=$H(a),a.each(function(a,c){a.each(function(a){if("array"===typeOf(a)){if("null"===typeOf(document.id(a[1])))return void fconsole('Fabrik form::addElements: Cannot add element "'+a[1]+'" because it does not exist in HTML.');var d=new window[a[0]](a[1],a[2]);b.push(this.addElement(d,a[1],c))}else if("object"===typeOf(a)){if("null"===typeOf(document.id(a.options.element)))return void fconsole('Fabrik form::addElements: Cannot add element "'+a.options.element+'" because it does not exist in HTML.');b.push(this.addElement(a,a.options.element,c))}else fconsole("null"!==typeOf(a)?"Fabrik form::addElements: Cannot add unknown element: "+a:"Fabrik form::addElements: Cannot add null element.")}.bind(this))}.bind(this)),c=0;c<b.length;c++)if("null"!==typeOf(b[c]))try{b[c].attachedToForm()}catch(d){fconsole(b[c].options.element+" attach to form:"+d)}Fabrik.fireEvent("fabrik.form.elements.added",[this])},addElement:function(a,b,c){b=a.getFormElementsKey(b),b=b.replace("[]","");var d="_ro"===b.substring(b.length-3,b.length);return a.form=this,a.groupid=c,this.formElements.set(b,a),Fabrik.fireEvent("fabrik.form.element.added",[this,b,a]),d&&(b=b.substr(0,b.length-3),this.formElements.set(b,a)),this.submitBroker.addElement(b,a),a},dispatchEvent:function(a,b,c,d){"string"===typeOf(d)&&(d=Encoder.htmlDecode(d));var e=this.formElements.get(b);if(!e){Object.each(this.formElements,function(a){b===a.baseElementId&&(e=a)})}e?""!==d?e.addNewEvent(c,d):Fabrik.debug&&fconsole("Fabrik form::dispatchEvent: Javascript empty for "+c+" event on: "+b):fconsole("Fabrik form::dispatchEvent: Cannot find element to add "+c+" event to: "+b)},action:function(a,b){this.formElements.get(b);Browser.exec("oEl."+a+"()")},triggerEvents:function(a){this.formElements.get(a).fireEvents(arguments[1])},watchValidation:function(a,b){if(this.options.ajaxValidation!==!1){var c=document.id(a);return"null"===typeOf(c)?void fconsole("Fabrik form::watchValidation: Could not add "+b+' event because element "'+a+'" does not exist.'):"fabrikSubElementContainer"===c.className?void c.getElements(".fabrikinput").each(function(a){a.addEvent(b,function(a){this.doElementValidation(a,!0)}.bind(this))}.bind(this)):void c.addEvent(b,function(a){this.doElementValidation(a,!1)}.bind(this))}},doElementValidation:function(a,b,c){var d;if(this.options.ajaxValidation!==!1&&(c="null"===typeOf(c)?"_time":c,"event"===typeOf(a)||"object"===typeOf(a)||"domevent"===typeOf(a)?(d=a.target.id,b===!0&&(d=document.id(a.target).getParent(".fabrikSubElementContainer").id)):d=a,"null"!==typeOf(document.id(d)))){document.id(d).getProperty("readonly")===!0||"readonly"===document.id(d).getProperty("readonly");var e=this.formElements.get(d);if(e||(d=d.replace(c,""),e=this.formElements.get(d))){if(Fabrik.fireEvent("fabrik.form.element.validation.start",[this,e,a]),this.result===!1)return void(this.result=!0);e.setErrorMessage(Joomla.JText._("COM_FABRIK_VALIDATING"),"fabrikValidating");var f=$H(this.getFormData());f.set("task","form.ajax_validate"),f.set("fabrik_ajax","1"),f.set("format","raw"),f=this._prepareRepeatsForAjax(f);var g=d;e.origId&&(g=e.origId+"_0"),e.options.repeatCounter=e.options.repeatCounter?e.options.repeatCounter:0;var h="index.php?option=com_fabrik&form_id="+this.id;this.options.lang!==!1&&(h+="&lang="+this.options.lang);{new Request({url:h,method:this.options.ajaxmethod,data:f,onComplete:function(a){this._completeValidaton(a,d,g)}.bind(this)}).send()}}}},_completeValidaton:function(a,b,c){if(a=JSON.decode(a),"null"===typeOf(a))return this._showElementError(["Oups"],b),void(this.result=!0);if(this.formElements.each(function(a){a.afterAjaxValidation()}),Fabrik.fireEvent("fabrik.form.element.validation.complete",[this,a,b,c]),this.result===!1)return void(this.result=!0);var d=this.formElements.get(b);"null"!==typeOf(a.modified[c])&&d.update(a.modified[c]),"null"!==typeOf(a.errors[c])?this._showElementError(a.errors[c][d.options.repeatCounter],b):this._showElementError([],b),this.options.toggleSubmit&&(this.options.mustValidate?(this.hasErrors.has(b)&&this.hasErrors.get(b)||(this.mustValidateEls[b]=!1),this.mustValidateEls.hasValue(!0)||this.toggleSubmit(!0)):this.toggleSubmit(0===this.hasErrors.getKeys().length))},_prepareRepeatsForAjax:function(a){return this.getForm(),"hash"===typeOf(a)&&(a=a.getClean()),this.form.getElements("input[name^=fabrik_repeat_group]").each(function(b){if(b.id.test(/fabrik_repeat_group_\d+_counter/)){var c=b.name.match(/\[(.*)\]/)[1];a["fabrik_repeat_group["+c+"]"]=b.get("value")}}),a},_showGroupError:function(a,b){var c,d=Array.from(this.options.pages.get(this.currentPage.toInt())),e=!1;return $H(b).each(function(b,f){if(f=f.replace(/\[(.*)\]/,"").replace(/%5B(.*)%5D/,""),this.formElements.has(f)){var g=this.formElements.get(f);if(d.contains(g.groupid.toInt())){if(a.errors[f]){var h="";"null"!==typeOf(a.errors[f])&&(h=a.errors[f].flatten().join("<br />")),""!==h?(c=this._showElementError(a.errors[f],f),e===!1&&(e=c)):g.setErrorMessage("","")}a.modified[f]&&g&&g.update(a.modified[f])}}}.bind(this)),e},_showElementError:function(a,b){var c="";"null"!==typeOf(a)&&(c=a.flatten().join("<br />"));var d=""===c?"fabrikSuccess":"fabrikError";return""===c?(delete this.hasErrors[b],c=Joomla.JText._("COM_FABRIK_SUCCESS")):this.hasErrors.set(b,!0),c="<span> "+c+"</span>",this.formElements.get(b).setErrorMessage(c,d),"fabrikSuccess"===d?!1:!0},updateMainError:function(){var a,b=this.form.getElement(".fabrikMainError");b.set("html",this.options.error),a=this.form.getElements(".fabrikError").filter(function(a){return!a.hasClass("fabrikMainError")}),a.length>0&&b.hasClass("fabrikHide")&&this.showMainError(this.options.error),0===a.length&&this.hideMainError()},hideMainError:function(){var a=this.form.getElement(".fabrikMainError");myfx=new Fx.Tween(a,{property:"opacity",duration:500,onComplete:function(){a.addClass("fabrikHide")}}).start(1,0)},showMainError:function(a){if(!Fabrik.bootstrapped||!this.options.ajaxValidation){var b=this.form.getElement(".fabrikMainError");b.set("html",a),b.removeClass("fabrikHide"),myfx=new Fx.Tween(b,{property:"opacity",duration:500}).start(0,1)}},_getButton:function(a){if(this.getForm()){var b=this.form.getElement("input[type=button][name="+a+"]");return b||(b=this.form.getElement("input[type=submit][name="+a+"]")),b||(b=this.form.getElement("button[type=button][name="+a+"]")),b||(b=this.form.getElement("button[type=submit][name="+a+"]")),b}},watchSubmit:function(){var a=this._getButton("Submit"),b=this._getButton("apply");if(a||b){var c=this._getButton("delete"),d=this._getButton("Copy");c&&c.addEvent("click",function(a){if(!confirm(Joomla.JText._("COM_FABRIK_CONFIRM_DELETE_1")))return!1;var b=Fabrik.fireEvent("fabrik.form.delete",[this,this.options.rowid]).eventResults;return"null"!==typeOf(b)&&0!==b.length&&b.contains(!1)?(a.stop(),!1):(this.form.getElement("input[name=task]").value="form.delete",void this.doSubmit(a,c))}.bind(this));var e=this.form.getElements("button[type=submit]").combine([b,a,d]);e.each(function(a){"null"!==typeOf(a)&&a.addEvent("click",function(b){this.doSubmit(b,a)}.bind(this))}.bind(this)),this.form.addEvent("submit",function(a){this.doSubmit(a)}.bind(this))}},mockSubmit:function(){var a=this._getButton("Submit");a||(a=new Element("button",{name:"Submit",type:"submit"})),this.doSubmit(new Event.Mock(a,"click"),a)},doSubmit:function(a,b){return this.submitBroker.enabled()?(a.stop(),!1):(this.submitBroker.submit(function(){if(this.options.showLoader&&Fabrik.loader.start(this.getBlock(),Joomla.JText._("COM_FABRIK_LOADING")),Fabrik.fireEvent("fabrik.form.submit.start",[this,a,b]),this.result===!1)return this.result=!0,a.stop(),Fabrik.loader.stop(this.getBlock()),void this.updateMainError();if(this.options.pages.getKeys().length>1&&this.form.adopt(new Element("input",{name:"currentPage",value:this.currentPage.toInt(),type:"hidden"})),this.options.ajax&&this.form){this.options.showLoader||Fabrik.loader.start(this.getBlock(),Joomla.JText._("COM_FABRIK_LOADING"));var c=$H(this.getFormData());c=this._prepareRepeatsForAjax(c),c[b.name]=b.value,"Copy"===b.name&&(c.Copy=1,a.stop()),c.fabrik_ajax="1",c.format="raw";{new Request.JSON({url:this.form.action,data:c,method:this.options.ajaxmethod,onError:function(a,b){fconsole(a+": "+b),this.showMainError(b),Fabrik.loader.stop(this.getBlock(),"Error in returned JSON")}.bind(this),onFailure:function(a){fconsole(a),Fabrik.loader.stop(this.getBlock(),"Ajax failure")}.bind(this),onComplete:function(c,d){if("null"===typeOf(c))return Fabrik.loader.stop(this.getBlock(),"Error in returned JSON"),void fconsole("error in returned json",c,d);var e=!1;if(void 0!==c.errors&&$H(c.errors).each(function(b,c){if(this.formElements.has(c)&&b.flatten().length>0)if(e=!0,this.formElements[c].options.inRepeatGroup){for(a=0;a<b.length;a++)if(b[a].flatten().length>0){var d=c.replace(/(_\d+)$/,"_"+a);this._showElementError(b[a],d)}}else this._showElementError(b,c)}.bind(this)),this.updateMainError(),e===!1){var f=!1;""===this.options.rowid&&"apply"!==b.name&&(f=!0),Fabrik.loader.stop(this.getBlock());var g="null"!==typeOf(c.msg)&&void 0!==c.msg&&""!==c.msg?c.msg:Joomla.JText._("COM_FABRIK_FORM_SAVED");if(c.baseRedirect!==!0)if(f=c.reset_form,void 0!==c.url)if("popup"===c.redirect_how){var h=c.width?c.width:400,i=c.height?c.height:400,j=c.x_offset?c.x_offset:0,k=c.y_offset?c.y_offset:0,l=c.title?c.title:"";Fabrik.getWindow({id:"redirect",type:"redirect",contentURL:c.url,caller:this.getBlock(),height:i,width:h,offset_x:j,offset_y:k,title:l})}else"samepage"===c.redirect_how?window.open(c.url,"_self"):"newpage"===c.redirect_how&&window.open(c.url,"_blank");else c.suppressMsg||alert(g);else f=void 0!==c.reset_form?c.reset_form:f,c.suppressMsg||alert(g);Fabrik.fireEvent("fabrik.form.submitted",[this,c]),"apply"!==b.name&&(f&&this.clearForm(),Fabrik.Windows[this.options.fabrik_window_id]&&Fabrik.Windows[this.options.fabrik_window_id].close())}else Fabrik.fireEvent("fabrik.form.submit.failed",[this,c]),Fabrik.loader.stop(this.getBlock(),Joomla.JText._("COM_FABRIK_VALIDATION_ERROR"))}.bind(this)}).send()}}Fabrik.fireEvent("fabrik.form.submit.end",[this]),this.result===!1?(this.result=!0,a.stop(),this.updateMainError()):this.options.ajax?(a.stop(),Fabrik.fireEvent("fabrik.form.ajax.submit.end",[this])):"null"!==typeOf(b)?(new Element("input",{type:"hidden",name:b.name,value:b.value}).inject(this.form),this.form.submit()):a.stop()}.bind(this)),void a.stop())},getFormData:function(a){a="null"!==typeOf(a)?a:!0,a&&this.formElements.each(function(a){a.onsubmit()}),this.getForm();var b=this.form.toQueryString(),c={};b=b.split("&");var d=$H({});b.each(function(a){a=a.split("=");var b=a[0];b=decodeURI(b),"[]"===b.substring(b.length-2)&&(b=b.substring(0,b.length-2),d.has(b)?d.set(b,d.get(b)+1):d.set(b,0),b=b+"["+d.get(b)+"]"),c[b]=a[1]});this.formElements.getKeys();return this.formElements.each(function(a,b){if("fabrikfileupload"===a.plugin&&(c[b]=a.get("value")),"null"===typeOf(c[b])){var d=!1;$H(c).each(function(a,c){c=unescape(c),c=c.replace(/\[(.*)\]/,""),c===b&&(d=!0)}.bind(this)),d||(c[b]="")}}.bind(this)),c},getFormElementData:function(){var a={};return this.formElements.each(function(b,c){b.element&&(a[c]=b.getValue(),a[c+"_raw"]=a[c])}.bind(this)),a},watchGroupButtons:function(){var a=this;jQuery(this.form).on("click",".deleteGroup",jQuery.debounce(this.options.debounceDelay,!0,function(b){if(b.preventDefault(),!a.addingOrDeletingGroup){a.addingOrDeletingGroup=!0;var c=b.target.getParent(".fabrikGroup"),d=b.target.getParent(".fabrikSubGroup");a.deleteGroup(b,c,d),a.addingOrDeletingGroup=!1}})),jQuery(this.form).on("click",".addGroup",jQuery.debounce(this.options.debounceDelay,!0,function(b){b.preventDefault(),a.addingOrDeletingGroup||(a.addingOrDeletingGroup=!0,a.duplicateGroup(b),a.addingOrDeletingGroup=!1)})),this.form.addEvent("click:relay(.fabrikSubGroup)",function(a,b){var c=b.getElement(".fabrikGroupRepeater");c&&(b.addEvent("mouseenter",function(){c.fade(1)}),b.addEvent("mouseleave",function(){c.fade(.2)}))}.bind(this))},duplicateGroupsToMin:function(){this.form&&(Fabrik.fireEvent("fabrik.form.group.duplicate.min",[this]),Object.each(this.options.group_repeats,function(a,b){if("null"!==typeOf(this.options.minRepeat[b])&&1===a.toInt()){var c,d,e,f,g,h,i,j=this.form.getElement("#fabrik_repeat_group_"+b+"_counter");if("null"!==typeOf(j)){c=d=j.value.toInt(),1===c&&(h=this.form.getElement("#"+this.options.group_pk_ids[b]+"_0"),"null"!==typeOf(h)&&""===h.value&&(d=0));var k=this.options.minRepeat[b].toInt();if(0===k&&0===d){f=this.form.getElement("#group"+b+" .deleteGroup"),i="null"!==typeOf(f)?new Event.Mock(f,"click"):!1;var l=this.form.getElement("#group"+b),m=l.getElement(".fabrikSubGroup");this.deleteGroup(i,l,m)}else if(k>c&&(e=this.form.getElement("#group"+b+" .addGroup"),"null"!==typeOf(e))){var n=new Event.Mock(e,"click");for(g=c;k>g;g++)this.duplicateGroup(n)}}}}.bind(this)))},deleteGroup:function(a,b,c){if(Fabrik.fireEvent("fabrik.form.group.delete",[this,a,b]),this.result===!1)return void(this.result=!0);a&&a.preventDefault();var d=0;b.getElements(".deleteGroup").each(function(b,c){jQuery(b).find("[data-role=fabrik_delete_group]")[0]===a.target&&(d=c)}.bind(this));var e=b.id.replace("group",""),f=document.id("fabrik_repeat_group_"+e+"_counter").get("value").toInt();if(f<=this.options.minRepeat[e]&&0!==this.options.minRepeat[e]){if(""!==this.options.minMaxErrMsg[e]){var g=this.options.minMaxErrMsg[e];g=g.replace(/\{min\}/,this.options.minRepeat[e]),g=g.replace(/\{max\}/,this.options.maxRepeat[e]),alert(g)}}else if(delete this.duplicatedGroups.i,"0"!==document.id("fabrik_repeat_group_"+e+"_counter").value){var h=b.getElements(".fabrikSubGroup");if(this.subGroups.set(e,c.clone()),h.length<=1)this.hideLastGroup(e,c),Fabrik.fireEvent("fabrik.form.group.delete.end",[this,a,e,d]);else{{var i=c.getPrevious();new Fx.Tween(c,{property:"opacity",duration:300,onComplete:function(){h.length>1&&c.dispose(),this.formElements.each(function(a,b){"null"!==typeOf(a.element)&&"null"===typeOf(document.id(a.element.id))&&(a.decloned(e),delete this.formElements[b])}.bind(this)),h=b.getElements(".fabrikSubGroup");var f={};this.formElements.each(function(a,b){a.groupid===e&&(f[b]=a.decreaseName(d))}.bind(this)),$H(f).each(function(a,b){b!==a&&(this.formElements[a]=this.formElements[b],delete this.formElements[b])}.bind(this)),Fabrik.fireEvent("fabrik.form.group.delete.end",[this,a,e,d])}.bind(this)}).start(1,0)}if(i){var j=document.id(window).getScroll().y,k=i.getCoordinates();if(k.top<j){var l=k.top;this.winScroller.start(0,l)}}}document.id("fabrik_repeat_group_"+e+"_counter").value=document.id("fabrik_repeat_group_"+e+"_counter").get("value").toInt()-1,this.repeatGroupMarkers.set(e,this.repeatGroupMarkers.get(e)-1),this.setRepeatGroupIntro(b,e)}},hideLastGroup:function(a,b){var c=b.getElement(".fabrikSubGroupElements"),d=new Element("div",{"class":"fabrikNotice alert"}).appendText(Joomla.JText._("COM_FABRIK_NO_REPEAT_GROUP_DATA"));if("null"===typeOf(c)){c=b;var e=c.getElement(".addGroup"),f=c.getParent("table").getElements("thead th").getLast();"null"!==typeOf(e)&&e.inject(f)}c.setStyle("display","none"),d.inject(c,"after")},isFirstRepeatSubGroup:function(a){var b=a.getElements(".fabrikSubGroup");return 1===b.length&&a.getElement(".fabrikNotice")},getSubGroupToClone:function(a){var b=document.id("group"+a),c=b.getElement(".fabrikSubGroup");c||(c=this.subGroups.get(a));var d=null,e=!1;return this.duplicatedGroups.has(a)&&(e=!0),e?d=c?c.cloneNode(!0):this.duplicatedGroups.get(a):(d=c.cloneNode(!0),this.duplicatedGroups.set(a,d)),d},repeatGetChecked:function(a){var b=[];return a.getElements(".fabrikinput").each(function(a){"radio"===a.type&&a.getProperty("checked")&&b.push(a)}),b},duplicateGroup:function(a){var b,c;if(Fabrik.fireEvent("fabrik.form.group.duplicate",[this,a]),this.result===!1)return void(this.result=!0);a&&a.preventDefault();var d=a.target.getParent(".fabrikGroup").id.replace("group",""),e=d.toInt(),f=document.id("group"+d),g=this.repeatGroupMarkers.get(d),h=document.id("fabrik_repeat_group_"+d+"_counter").get("value").toInt();if(h>=this.options.maxRepeat[d]&&0!==this.options.maxRepeat[d]){if(""!==this.options.minMaxErrMsg[d]){var i=this.options.minMaxErrMsg[d];i=i.replace(/\{min\}/,this.options.minRepeat[d]),i=i.replace(/\{max\}/,this.options.maxRepeat[d]),window.alert(i)}}else{if(document.id("fabrik_repeat_group_"+d+"_counter").value=h+1,this.isFirstRepeatSubGroup(f)){var j=f.getElements(".fabrikSubGroup"),k=j[0].getElement(".fabrikSubGroupElements");if("null"===typeOf(k)){f.getElement(".fabrikNotice").dispose(),k=j[0];var l=f.getElement(".addGroup");l.inject(k.getElement("td.fabrikGroupRepeater")),k.setStyle("display","")}else j[0].getElement(".fabrikNotice").dispose(),j[0].getElement(".fabrikSubGroupElements").show();return void this.repeatGroupMarkers.set(d,this.repeatGroupMarkers.get(d)+1)}var m=this.getSubGroupToClone(d),n=this.repeatGetChecked(f),o=f.getElement("table.repeatGroupTable");o?(o.getElement("tbody")&&(o=o.getElement("tbody")),o.appendChild(m)):f.appendChild(m),n.each(function(a){a.setProperty("checked",!0)}),this.subelementCounter=0;var p=[],q=!1,r=m.getElements(".fabrikinput"),s=null;this.formElements.each(function(a){var d=!1;b=null;var e=-1;if(r.each(function(f){q=a.hasSubElements(),c=f.getParent(".fabrikSubElementContainer");var h=q&&c?c.id:f.id,i=a.getCloneName();if(h===i||h===i+"-auto-complete"){if(s=f,d=!0,q)e++,b=f.getParent(".fabrikSubElementContainer"),document.id(h).getElement("input")&&f.cloneEvents(document.id(h).getElement("input"));else{f.cloneEvents(a.element);var j=Array.from(a.element.id.split("_"));j.splice(j.length-1,1,g),f.id=j.join("_");var k=f.getParent(".fabrikElementContainer").getElement("label");k&&k.setProperty("for",f.id)}"null"!==typeOf(f.name)&&(f.name=f.name.replace("[0]","["+g+"]"))}}.bind(this)),d){if(q&&"null"!==typeOf(b)){var f=Array.from(a.options.element.split("_"));f.splice(f.length-1,1,g),b.id=f.join("_")}var h=(a.options.element,a.unclonableProperties()),i=new CloneObject(a,!0,h);i.container=null,i.options.repeatCounter=g,q&&"null"!==typeOf(b)?(i.element=document.id(b),i.cloneUpdateIds(b.id),i.options.element=b.id,i._getSubElements()):i.cloneUpdateIds(s.id),p.push(i)}}.bind(this)),p.each(function(a){a.cloned(g);var b=new RegExp(this.options.group_pk_ids[e]);!this.options.group_copy_element_values[e]||this.options.group_copy_element_values[e]&&a.element.name&&a.element.name.test(b)?a.reset():a.resetEvents()}.bind(this));var t={};t[d]=p,this.addElements(t);var u=window.getHeight(),v=document.id(window).getScroll().y,w=m.getCoordinates();if(w.bottom>v+u){var x=w.bottom-u;this.winScroller.start(0,x)}{new Fx.Tween(m,{property:"opacity",duration:500}).set(0)}m.fade(1),Fabrik.fireEvent("fabrik.form.group.duplicate.end",[this,a,d,g]),this.setRepeatGroupIntro(f,d),this.repeatGroupMarkers.set(d,this.repeatGroupMarkers.get(d)+1)}},setRepeatGroupIntro:function(a,b){var c=this.options.group_repeat_intro[b],d="",e=a.getElements('*[data-role="group-repeat-intro"]');e.each(function(a,b){d=c.replace("{i}",b+1),this.formElements.each(function(a){
if(!a.options.inRepeatGroup){var b=new RegExp("{"+a.element.id+"}");d=d.replace(b,a.getValue())}}),a.set("html",d)}.bind(this))},update:function(a){if(Fabrik.fireEvent("fabrik.form.update",[this,a.data]),this.result===!1)return void(this.result=!0);var b=arguments[1]||!1,c=a.data;if(this.getForm(),this.form){var d=this.form.getElement("input[name=rowid]");d&&c.rowid&&(d.value=c.rowid)}this.formElements.each(function(d,e){"null"===typeOf(c[e])&&"_ro"===e.substring(e.length-3,e.length)&&(e=e.substring(0,e.length-3)),"null"===typeOf(c[e])?a.id!==this.id||b||d.update(""):d.update(c[e])}.bind(this))},reset:function(){return this.addedGroups.each(function(a){var b=document.id(a).findClassUp("fabrikGroup"),c=b.id.replace("group","");document.id("fabrik_repeat_group_"+c+"_counter").value=document.id("fabrik_repeat_group_"+c+"_counter").get("value").toInt()-1,a.remove()}),this.addedGroups=[],Fabrik.fireEvent("fabrik.form.reset",[this]),this.result===!1?void(this.result=!0):void this.formElements.each(function(a){a.reset()}.bind(this))},showErrors:function(a){var b=null;if(a.id===this.id){var c=new Hash(a.errors);c.getKeys().length>0&&("null"!==typeOf(this.form.getElement(".fabrikMainError"))&&(this.form.getElement(".fabrikMainError").set("html",this.options.error),this.form.getElement(".fabrikMainError").removeClass("fabrikHide")),c.each(function(a,c){if("null"!==typeOf(document.id(c+"_error")))for(var d=document.id(c+"_error"),e=(new Element("span"),0);e<a.length;e++)for(var f=0;f<a[e].length;f++)b=new Element("div").appendText(a[e][f]).inject(d);else fconsole(c+"_error not found (form show errors)")}))}},appendInfo:function(a){this.formElements.each(function(b,c){b.appendInfo&&b.appendInfo(a,c)}.bind(this))},clearForm:function(){this.getForm(),this.form&&(this.formElements.each(function(a,b){b===this.options.primaryKey&&(this.form.getElement("input[name=rowid]").value=""),a.update("")}.bind(this)),this.form.getElements(".fabrikError").empty(),this.form.getElements(".fabrikError").addClass("fabrikHide"))},stopEnterSubmitting:function(){var a=this.form.getElements("input.fabrikinput");a.each(function(b,c){b.addEvent("keypress",function(b){"enter"===b.key&&(b.stop(),a[c+1]&&a[c+1].focus(),c===a.length-1&&this._getButton("Submit").focus())}.bind(this))}.bind(this))},getSubGroupCounter:function(){},addMustValidate:function(a){this.options.ajaxValidation&&this.options.toggleSubmit&&(this.mustValidateEls.set(a.element.id,a.options.mustValidate),a.options.mustValidate&&(this.options.mustValidate=!0,this.toggleSubmit(!1)))},toggleSubmit:function(a){var b=this._getButton("Submit");"null"!==typeOf(b)&&(a===!0?(b.disabled="",b.setStyle("opacity",1)):(b.disabled="disabled",b.setStyle("opacity",.5)))}});