// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {remote} = require('electron')
const {Menu, MenuItem, screen} = remote	//screen used in main.js

var mainmenu = null
var ctxmenu = null		//context menu
var fltsubmenu=null		//mainmenu.filter.submenu, assign in mainMenuSet()
var layoutmenu=null		//mainmenu.layout.submenu, assign in mainMenuSet()
var MNUCOLS=3
var MNUROWS=MNUCOLS+1
var MNUVERT=MNUCOLS+2
var MNUWALL=MNUCOLS+3

exports.sayhey = function() {
	console.log('Hey Hey Hey!')
}
exports.execFile = function(obj) {
	var path = ''
	if(obj.isFile)
		path = `"${obj.path}"`	//remove: file:///
	else
		path = `explorer "${obj.path}"`
	exec(path)
}
exports.fldrBrowse = function(obj) {
	fldrBrowse(obj)
}
/*
exports.fldrLoad = function(fldr) {	//generate a file list for obj
	//assume obj.isDirectory === true
	//returns {fldr:[path], items:[{},...], defaultImageNum:n}
	//console.log('fldLoad():'+fldr)
	const main = remote.require('./main.js')
	var result = main.fldrLoad(fldr)
	//console.log('fldLoad() result:')
	//console.log(result)
	return result
}
*/
exports.mainMenuGen = function(exts, layoutmode) {
	var template = [
	  {
	    label: 'App',
	    submenu: [
				{
	        label: 'Change Folder',
	        accelerator: 'Alt+F',
					click: function(item, focusedWindow){
						console.log('Change Folder')
						const {dialog} = remote
						var dir = dialog.showOpenDialog(focusedWindow, {
							defaultPath: './',
							filter:[{name: 'All Files', extensions: ['*']}],
							properties: ['openDirectory'],
							title:'Change Folder'
						})
						console.log(dir)
						const main = remote.require('./main.js')
						var fileObj = main.fldrLoad(dir[0])
						items = fileObj.items
						loadFunc(lastLayoutMode)
					}
	      },{
        	type: 'separator'
      	},{
	        label: 'Close', role: 'quit'
	      },/*{
					label: 'Minimize', role: 'minimize'
				},*/{
	        label: 'DevTools', role: 'toggledevtools',
	      },{
	        label: 'Full Screen', role: 'togglefullscreen'
				},{
	        label: 'Reload', role: 'reload'
				},{
					label: 'Zoom In', role: 'zoomin'
	      },{
					label: 'Zoom Out', role: 'zoomout'
	      },{
					label: 'Zoom Reset', role: 'resetzoom'
				},
	    ]
	  },{
			label: 'Layout',
			submenu: [
				/*{	label: 'Redraw',
						click: function(item, win, ev) {
							isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
				},*/{	label: 'Show all',
						accelerator: 'Alt+A',
						click: function(item, win, ev) {
							loadFunc(lastLayoutMode)
							//isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
				},{	label: 'Shuffle',
						accelerator: 'Alt+S',
						click: function(item, win, ev) {
							isotope.shuffle()
							isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
				},{ 	type: 'separator'
				},{	label: 'Cols',
						accelerator: 'Alt+C', type:'radio',
						click: function(item, win, ev) {
							loadFunc('masonry')
							isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
				},/*{	label: 'horizontal',
						click: function(item, win, ev) {
							loadFunc('horiz')
						}
				},*/{		label: 'Rows',
					accelerator: 'Alt+R', type:'radio',
					click: function(item, win, ev) {
						loadFunc('fitRows')
						isotope.layout()
						//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
					}
				},{	label: 'Vertical',
						accelerator: 'Alt+V', type:'radio',
						click: function(item, win, ev) {
							loadFunc('vertical')
							isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
				},{	label: 'Wall',
						accelerator: 'Alt+W', type:'radio',
						click: function(item, win, ev) {
							loadFunc('packery')
							isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
				}
			]
		},{
	    label: 'Filter',
	    submenu: fltSubmenuGen(exts, false)
	  },{
	    label: 'Help',
	    role: 'help',
	    submenu: [
				{
					label: 'About FolderView',
	        click: function() { require('electron').shell.openExternal('http://184.68.158.254') }
				},{
	        label: 'About Electron',
	        click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
	      },
	    ]
	  },
	];
	mainmenu = Menu.buildFromTemplate(template);
	fltsubmenu = mainmenu.items[2].submenu
	Menu.setApplicationMenu(mainmenu);
	layoutmenu = mainmenu.items[1].submenu
			 if(layoutmode=='masonry')	layoutmenu.items[MNUCOLS].checked=true
	else if(layoutmode=='fitRows')	layoutmenu.items[MNUROWS].checked=true
	else if(layoutmode=='vertical')	layoutmenu.items[MNUVERT].checked=true
	else if(layoutmode=='packery')	layoutmenu.items[MNUWALL].checked=true
}
exports.contextMenuSet = function(exts) {
	var objClicked = null
	var menupos = {x:0, y:0}

	window.addEventListener('contextmenu', (e) => {
		const {webFrame} = require('electron')
		var curzoom = Math.round(webFrame.getZoomFactor() *100)/100
		menupos.x = e.clientX
		menupos.y = e.clientY
		var template = [	//basic context menu
			{
				label: 'Close', role: 'quit'
			},{
				label: 'DevTools',
				click: function(item, focusedWindow) {
					if (focusedWindow)
						focusedWindow.toggleDevTools();
				}
			},{
		    label: 'Filter',
		    submenu: fltSubmenuGen(exts, true)
		  },{
					label: 'Fullscreen', role: 'togglefullscreen'
			},{
		    label: 'Layout',
		    submenu: [
					/*{	label: 'Redraw',
		        	click: function(item, win, ev) {
								isotope.layout()
								//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
							}
					},*/{	label: 'Show all',
							accelerator: 'Alt+A',
		        	click: function(item, win, ev) {
								loadFunc(lastLayoutMode)
								//isotope.layout()
								//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
							}
					},{	label: 'Shuffle',
							accelerator: 'Alt+S',
		        	click: function(item, win, ev) {
								isotope.shuffle()
								isotope.layout()
								//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
							}
					},{ 	type: 'separator'
					},{	label: 'Cols',
							accelerator: 'Alt+C', type:'radio',
							checked: layoutmenu.items[MNUCOLS].checked,
		        	click: function(item, win, ev) {
								var item = layoutmenu.items[MNUCOLS]
								item.click(item, win, ev)
							}
					},/*{	label: 'horizontal',
		        	click: function(item, win, ev) {
								loadFunc('horiz')
							}
					},*/{		label: 'Rows',
						accelerator: 'Alt+R', type:'radio',
						checked: layoutmenu.items[MNUROWS].checked,
		        click: function(item, win, ev) {
							var item = layoutmenu.items[MNUROWS]
							item.click(item, win, ev)
							//loadFunc('fitRows')
							//isotope.layout()
							//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
						}
					},{	label: 'Vertical',
							accelerator: 'Alt+V', type:'radio',
							checked: layoutmenu.items[MNUVERT].checked,
		        	click: function(item, win, ev) {
								var item = layoutmenu.items[MNUVERT]
								item.click(item, win, ev)
								//loadFunc('vertical')
								//isotope.layout()
								//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
							}
					},{	label: 'Wall',
							accelerator: 'Alt+W', type:'radio',
							checked: layoutmenu.items[MNUWALL].checked,
		        	click: function(item, win, ev) {
								var item = layoutmenu.items[MNUWALL]
								item.click(item, win, ev)
								//loadFunc('packery')
								//isotope.layout()
								//ctxmenu.popup(win, menupos.x, menupos.y, item.position)
							}
					}
		    ]
		  },{
				label: 'Scale+0.3',
				click: function(item, win, ev) {
					scale = Math.round((scale +0.3) *10)/10
					loadFunc(lastLayoutMode)
					console.log('Scale: '+scale)
				}
			},{
				label: 'Scale-0.3',
				click: function(item, win, ev) {
					if(scale===0.1) {
						console.log('Scale can not go below zero.')
						return
					}
					scale = Math.round((scale -0.3) *10)/10
					if(scale <= 0) scale=0.1
					loadFunc(lastLayoutMode)
					console.log('Scale: '+scale)
				}
			},{
				label: `Scale=1 (${scale})`,
				click: function(item, win, ev) {
					scale = 1
					loadFunc(lastLayoutMode)
					console.log('Scale: '+scale)
				}
			},{
				label: 'Scroll',
				click: function(item, win, ev) {
					pageScrollToggle()
				}
			}
		]
		if(e==undefined || !e.target.id || objprefix.indexOf(e.target.id.substr(0,3)) < 0) {
			objClicked = null
		}
		else {		//prepend obj functions to template
			objClicked = e.target
			var obj = idToObj(objClicked.id)

			//obj - tools
			var tooltmpl =[
				{	label: 'Delete',
					click: function(item, win, ev) {
						var obj = idToObj(objClicked.id)
						console.log(`Delete: [${obj.path}`)
						if(!confirm(`Delete:\n[${obj.path}]`)) return
						const fs = require('fs');
						if(obj.isDirectory)
							fs.rmdir(obj.path)
						else
							fs.unlinkSync(obj.path)
						//failed in Win7:
						//var path = `del "${obj.path}"`
						//exec(path)
						//leave item in list to keep items[pid] accurate
						var el = document.getElementById('obj'+obj.pid)
						isotope.remove( el )
						el.style.display = 'none'
					}
				},{	label: 'Explore',
						click: function(item, win, ev) {
							var obj = idToObj(objClicked.id)
							var cmd = `explorer /select, "${obj.path}"`
							exec(cmd)
						}
				},{ label: 'Path to clipboard',
					click: function(item, win, ev) {
						const {clipboard} = require('electron')
						clipboard.writeText(obj.path)
					}
				},{ label: 'src to clipboard',
					click: function(item, win, ev) {
						const {clipboard} = require('electron')
						clipboard.writeText(obj.src)
					}
				}
			]
			//obj - image menu items
			if(obj.type==='.jpg' || obj.type==='.png') {
				tooltmpl.push({ label: 'Set background - repeat',
					click: function(item, win, ev) {
						document.body.style.background = `repeat url("${obj.src}")`
						document.body.style.backgroundSize =	`auto`
					}
				})
				tooltmpl.push({ label: 'Set background - norepeat',
					click: function(item, win, ev) {
						document.body.style.background = `fixed no-repeat url("${obj.src}")`
						document.body.style.backgroundSize =	`cover`
					}
				})
			}

			//obj - general menu items
			template.unshift(	{ 	type: 'separator' })
			template.unshift(	{
					label: 'Tools',
					submenu: tooltmpl
			})
			template.unshift(	{
					label: 'Open',
					click: function(item, win, ev) {
						//var obj = idToObj(objClicked.id)
						if(obj.isDirectory===true){
							fldrBrowse(obj)
							return
						}
						exec(`"${obj.path}"`)
					}
			})
			template.unshift(	{
					label: 'Hide',
					click: function(item, win, ev) {
						var obj = idToObj(objClicked.id)
						var el = document.getElementById('obj'+obj.pid)
						isotope.hideItemElements( el )
						isotope.layout()
					}
			})
		}
	  e.preventDefault()
		ctxmenu = Menu.buildFromTemplate(template);
	  ctxmenu.popup(remote.getCurrentWindow())
	}, false)
}

function idToObj(id) {
	var pid = id.substr(3,10)
	var obj = items[pid]
	return obj
}
function exec(command) {
	console.log('Launching:['+command+']')
	const exec = require('child_process').exec;
	const child = exec(command, (error, stdout, stderr) => {
		//bug: error always generated even if command succeeds
		if(error && error.code != 1) {	//windows apps return 1 on success
			console.log('exec() error:\n['+error+']');
			console.log(`error.code: [${error.code}]`);
			alert('exec() error:\n['+error+']');
		}
	})
}
function fldrBrowse(obj) {
	console.log('Launching:['+obj.path+']')
	//const app = remote.app
	const {webFrame} = require('electron')
	//var zoomfactor = webFrame.getZoomFactor()
	const {browserLaunch} = remote.require('./main.js')
	var win = browserLaunch(obj.path, false, scale, false, lastLayoutMode, false, fontSize)
	console.log(win)
	return win
}
function filterAdd(ext, item){
	if(item===undefined) item=null

	if(ext==='ALL'){
		Object.assign(gExtFilter, exts)	//clone
		loadFunc(lastLayoutMode)
		var ii=0
		for(var key in exts){			//update menu items
			//mainmenu.items[2].submenu.items[ii].checked=true
			fltsubmenu.items[ii].checked=true
			ii++
		}
	} else
	if(gExtFilter[ext]===undefined) {
		gExtFilter[ext]=1
		loadFunc(lastLayoutMode)
	}
	if(item !== null && item.isCtxMenu===true)	{ //called from context menu
		fltsubmenu.items[item.itemId].checked=true
	}
}
function filterRemove(ext, item){
	if(item===undefined) item=null
	if(ext==='ALL'){
		gExtFilter = {}
		loadFunc(lastLayoutMode)
		var ii=0
		for(var key in exts){
			//mainmenu.items[2].submenu.items[ii].checked=false
			fltsubmenu.items[ii].checked=false
			ii++
		}
	} else
	if(gExtFilter[ext]!==undefined) {
		delete gExtFilter[ext]
		loadFunc(lastLayoutMode)
	}
	if(item !== null && item.isCtxMenu===true)	{ //called from context menu
		fltsubmenu.items[item.itemId].checked=false
	}
}
function fltSubmenuGen(exts, isCtxMenu) {
	if(isCtxMenu===undefined) isCtxMenu = false

	var fltsub = [], arr = []

	for(key in exts) {  arr.push(key) }
	arr.sort()

	for(var idx=0; idx<arr.length; idx++) {
		var key = arr[idx]
		fltsub.push({
			label: `${key} (${exts[key]})`,
			type:'checkbox', accelerator: `Alt+${idx+1}`,
			checked:(isCtxMenu===false ?true :fltsubmenu.items[0].checked),
			isCtxMenu:isCtxMenu, itemId:idx,
			click: function(item, win){
				var ii = item.label.lastIndexOf('(')
				var ext = item.label.substr(0, ii-1)
				if(item.checked===true){
					console.log(`${ext} On`);
					filterAdd(ext, item)
				}
				else {
					console.log(`${ext} Off`);
					filterRemove(ext, item)
				}
			}
		})
	}
	fltsub.push({type:'separator'	})
	fltsub.push({
		label: `Hide All`, accelerator: 'Alt+-',
		click: function(item, win){
			filterRemove('ALL')
		}
	})
	fltsub.push({
		label: `Show All`, accelerator: 'Alt+=',
		click: function(item, win){
			filterAdd('ALL')
		}
	})
	return fltsub
}