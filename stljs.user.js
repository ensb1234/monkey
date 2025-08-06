// ==UserScript==
// @name         stljs
// @namespace    http://tampermonkey.net/
// @version      2025-08-06
// @description  try to take over the world!
// @author       ens
// @match        https://gdipx.yanxiu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yanxiu.com
// @license      MIT
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/ensb1234/monkey/blob/main/stljs.user.js
// @downloadURL  https://raw.githubusercontent.com/ensb1234/monkey/blob/main/stljs.user.js
// ==/UserScript==

(function () {
	'use strict';
	setTimeout(function () {

		let you = {
			FIND_CONTINUE: true,
			FIND_DISCONTINUE: false,
			LIST_UNFINISHED: false,
			LIST_FINISH: true,
			sq: function (str) {
				return document.querySelector(str);
			},
			sqa: function (str) {
				return document.querySelectorAll(str);
			},
			getv: function (name, def) {
				return GM_getValue(name, def);
			},
			setv: function (name, val) {
				return GM_setValue(name, val);
			},
			findAndDo: null,
			log: null,
			totalLog: null,
			currentTime: 0,
			newTime: 0,
			pauseTime: 0,
			setStatus: null,
			getStatus: null,
			setMessage: null,
			getMessage: null,
			init: null,
			findNewStudy: null,
			findNewCourse: null,
			findNewVideo: null,
			interval: null
		};
		/**
		 * 用于对某元素组各个元素运行相应函数func(i)，其返回值代表是否应该继续遍历下去。
		 * findAndDo的返回值则代表列表是否被遍历完毕。
		 */
		you.findAndDo = function (keys, func) {
			let elems = document.querySelectorAll(keys);
			for (let i = 0; i < elems.length; i++) {
				if (func(i, elems[i], elems) == you.FIND_DISCONTINUE) {
					return you.LIST_UNFINISHED;
				}
			}
			return you.LIST_FINISH;
		};
		//子窗口log
		you.log = function (str) {
			console.log(str);
			you.setv('message', str);
		};
		//总窗口log
		you.totalLog = function () {
			let message = you.getMessage();
			console.log(message);
			if (message != '没事发生！') {
				you.setMessage('没事发生！');
			}
		};
		you.setMessage = function (message) {
			you.setv('message', message);
		};
		you.getMessage = function () {
			return you.getv('message', '没事发生！');
		}
		you.setStatus = function (status) {
			you.setv('status', status);
		}
		you.getStatus = function () {
			return you.getv('status', 'init');
		}

		you.findNewStudy = function () {
			let res = you.findAndDo('.tool-card', function (i, q, qs) {
				if (q.querySelector('.strong-color').innerText == q.querySelector(
					'.amount-score').innerText.slice(1, -1)) {
					//已经满分
					return you.FIND_CONTINUE;
				} else {
					//还没满分
					q.click();
					return you.FIND_DISCONTINUE;
				}
			});
		};
		you.findNewCourse = function () {
			let res = you.findAndDo('.course-item', function (i, q, qs) {
				if (q.innerText.indexOf('已观看 100%') > -1) {
					return you.FIND_CONTINUE;
				} else {
					//找到没看过的了
					you.setStatus('正在播放视频：' + q.innerText);
					q.querySelector('.learn-btn').click();
					return you.FIND_DISCONTINUE;
				}
			});
			if (res == you.LIST_FINISH) {
				//遍历完毕，竟然全看完了
				you.log('你竟然看完了一车视频？');
				let res2 = you.findAndDo('.number', function (i, q, qs) {
					if (q.className.indexOf('is-active') > -1) {
						if (qs.length - 1 == i) {
							you.log('有个课程全看完了，跑');
							you.setStatus('myStudy end');
							window.opener = null;
							window.open('', '_self');
							window.close();
						} else {
							you.log('不好意思，还有一车');
							qs[i + 1].click();
						}
						return you.FIND_DISCONTINUE;
					}
					return you.FIND_CONTINUE;
				});
				if (res2 == you.LIST_FINISH) {
					//全部看完
					you.log('有个课程全看完了，跑');
					you.setStatus('myStudy end');
					window.opener = null;
					window.open('', '_self');
					window.close();
				}
			}
		};
		you.findNewVideo = function () {
			let res = you.findAndDo('.res-item', function (i, q, qs) {
				if (q.className.indexOf('active') > -1) {
					if (qs.length - 1 == i) {
						//最后一个视频了
						you.log('全看完了，拜拜');
						you.setStatus('course end');
						window.opener = null;
						window.open('', '_self');
						window.close();
					} else {
						you.log('再看一个！（根本不想）');
						qs[i + 1].querySelector('.res-name').click();
					}
					return you.FIND_DISCONTINUE;
				} else {
					return you.FIND_CONTINUE;
				}
			});
			if (res == you.LIST_FINISH) {
				you.log('全看完了，拜拜');
				you.setStatus('course end');
				window.opener = null;
				window.open('', '_self');
				window.close();
			}
		}


		you.init = function () {
			if (unsafeWindow.youh) {
				console.log('卧槽，已经有这个变量了！');
			} else {
				unsafeWindow.youh = you;
			}
			if (window.location.href.indexOf('train2') > -1) {
				if (window.location.href.indexOf('myStudy') > -1) {
					you.findNewStudy();
				} else if (window.location.href.indexOf('workspace') > -1) {
					you.log('课程开始了，请准备好医疗箱、炸药包');
					you.findNewCourse();
				}
			}
		}

		you.interval = setInterval(function () {
			if (document.querySelector('.vcp-timelabel')) {
				//视频播放页
				you.newTime = document.querySelector('.vcp-timelabel').innerText;
				if (document.querySelector('.ended-mask').style.display != 'none') {
					//视频结束画面
					you.log('哥哥，你竟然看完了一个视频！这下不得不奖励你了：');
					you.findNewVideo();
					return;
				}
				if (document.querySelector('.action-timer').innerText.indexOf('已完成') > -1) {
					//进度满
					you.log('全看完了，拜拜');
					you.setStatus('course end');
					window.opener = null;
					window.open('', '_self');
					window.close();
				}
				if (you.newTime == you.currentTime) {
					//停止了
					you.pauseTime++;
					if (document.querySelector('.scoring-wrapper').style.display != 'none') {
						you.log('给你四星半好评，boom！');
						let moveEvent = new MouseEvent('mousemove', {
							'view': unsafeWindow,
							'bubbles': true, // 事件是否会在它冒泡到 DOM 树上的时候触发父级元素的事件处理器
							'cancelable': true, // 是否可以用 preventDefault() 取消默认动作
							'clientX': 100, // 鼠标指针的 X 坐标
							'clientY': 200 // 鼠标指针的 Y 坐标
						});
						document.querySelectorAll('.rate-item')[9].dispatchEvent(moveEvent);
						document.querySelectorAll('.rate-item')[9].click();
						document.querySelectorAll('.ivu-btn.ivu-btn-primary')[1].click();
						return;
					}
					if (document.querySelector('.alarmClock-wrapper').style.display != 'none') {
						you.log('有个点我继续计时，艹，点他！');
						document.querySelector('.alarmClock-wrapper').click();
						return;
					}
					if (you.pauseTime > 3) {
						you.log('不知道发生了什么反正停止了，不要停！快，自己动！');
						document.querySelector('.vcp-playtoggle').click();
					}
				} else {
					you.pauseTime = 0;
				}
				you.currentTime = you.newTime;
			} else if (window.location.href.indexOf('train2') > -1) {
				if (window.location.href.indexOf('myStudy') > -1) {
					//我的学情页
					if (you.getStatus() == 'myStudy end') {
						you.setStatus('myStudy init');
						location.reload();
					}
					you.totalLog();
				} else if (window.location.href.indexOf('workspace') > -1) {
					//课程列表页
					if (you.sq('.score').innerText == you.sq('.total-score').innerText.slice(0, -1)) {
						//满分了
						you.log('有个课程满分了，跑');
						you.setStatus('myStudy end');
						window.opener = null;
						window.open('', '_self');
						window.close();
					}
					if (you.getStatus() == 'course end') {
						you.setStatus('course init');
						location.reload();
					}
				}
			} else {
				return;
			}
		}, 3000);
		you.init();
	}, 3000);


})();



