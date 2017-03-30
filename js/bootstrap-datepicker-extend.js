jQuery.v6datepicker = function(options) {
	
	var defaultOptions = {  // 默认选项
			id: "",
			width: 400,
			customSelector: true,
			monthSelector: true,
			weekSelector: false,
			ajaxURL: "",
			defaultDisplayStart: "",
			defaultDisplayEnd: "",
			defaultCustomStart: "",
			defaultCustomEnd: "",
			defaultMonth: ""
		  },
		  parameters = $.extend({}, defaultOptions, options);
	
	if (parameters.id == null || parameters.id == "" || parameters.id == "undefined") {
		alert("无法通过 ID 确定时间选择插件位置，请指定 ID！");
		return;
	}
	
	var itemNumber = 0,  // itemNumber 是 head 中的选择项的数目
		  firstItem = 0,  // 时间选择插件选择框 head 中的 items 打开时默认的选中项
		  pluginHead = "<div class='datepicker-plugin-head'><div class='datepicker-plugin-head-items'>";  // 时间选择插件选择框 head
	
	if(parameters.customSelector == true) {  // 【自定义选择】需要显示
		itemNumber++;
		pluginHead += "<div class='datepicker-plugin-head-items-custom' unselectable='on'>自定义选择</div>";
		firstItem = 1;
	}
	if(parameters.monthSelector == true) {  // 【按月选择】需要显示
		itemNumber++;
		pluginHead += "<div class='datepicker-plugin-head-items-month' unselectable='on'>按月选择</div>";
		if (firstItem == 0) {
			firstItem = 2;
		}
	}
	if(parameters.weekSelector == true) {  // 【按投放周选择】需要显示
		itemNumber++;
		pluginHead += "<div class='datepicker-plugin-head-items-week' unselectable='on'>按投放周选择</div>";
		if (firstItem == 0) {
			firstItem = 3;
		}
	}
	pluginHead += "</div></div>";
	if(itemNumber == 0) {
		alert("无法生成日期选择插件，错误原因：无选择项！");
		return;
	}
	
	// 日期格式化函数
	var formatDate = function(y, m, d) {
		m = m < 10 ? ('0' + m) : m;
		d = d < 10 ? ('0' + d) : d;
		return y + '-' + m + '-' + d;
	};
	
	// 变量声明
	var oneDayLong = 24 * 60 * 60 * 1000,  // 一天的毫秒数
		  today = new Date(),  // 今天
		  nowTime = today.getTime(),  // 当前时间
		  todayWeekDay = today.getDay(),  // 今天对应的星期
		  todayDate = today.getDate(),  // 今天对应的日期
		  todayMonth = today.getMonth() + 1,  // 今天对应的月份
		  todayYear = today.getFullYear(),  // 今天对应的年
		  currentMonth = new Date(todayYear, todayMonth, 0),  // 当前月份
		  displayMonth = currentMonth,  // 日期范围显示栏当前显示月份
		  dateString = formatDate(todayYear, todayMonth, todayDate),  // 日期字符串：yyyy-mm-dd
		  checkLiIsClicked = false,  // 判断下拉选项中的 li 是否被点击，用来区分是否为用户自定义时间范围
		  monthSelectorOptions = {year: 0, month: 0, day: 01},
		  datepickerBarString = "",
		  $thisDatepicker = $("#" + parameters.id);
	
	// 如果原来有时间选择插件，则清空原来的插件内容（特别是在修改 AJAX 地址并重新传入时）
	$thisDatepicker.empty();
	
	// 初始化【按月选择】参数
	if (parameters.defaultMonth == "" || parameters.defaultMonth == null || parameters.defaultMonth == "undefined") {
		monthSelectorOptions.year = todayYear;
		monthSelectorOptions.month = today.getMonth() < 10 ? ('0' + today.getMonth()) : today.getMonth();
	} else {
		var y = parseInt(parameters.defaultMonth.substring(0, 4)),
			  m = parseInt(parameters.defaultMonth.substring(4, 6));
		monthSelectorOptions.year = y;
		monthSelectorOptions.month = (m - 1) < 10 ? ('0' + (m - 1)) : (m - 1);
	}
	
	if (!$thisDatepicker.hasClass("datepicker-bar")) {
		$thisDatepicker.addClass("datepicker-bar");
	}
	
	datepickerBarString += "<div class='datepicker-display'>";  // --------------------------------------------------------时间选择插件日期范围显示栏开始
	datepickerBarString += "<div class='datepicker-display-prevmonth' title='上月'></div>";  // -------------------【上月】按钮
	datepickerBarString += "<div class='datepicker-display-daterange dprange'>";  // -------------------------------日期范围显示框开始
	datepickerBarString += "<div class='datepicker-display-daterange dpstart'></div>";  // ------------------------日期范围开始日期
	datepickerBarString += "<div class='datepicker-display-daterange dpto'>至</div>";  // -------------------------“至”
	datepickerBarString += "<div class='datepicker-display-daterange dpend'></div>";  // -------------------------日期范围结束日期
	datepickerBarString += "</div>";  // -----------------------------------------------------------------------------------------日期范围显示框结束
	datepickerBarString += "<div class='datepicker-display-nextmonth' title='下月'></div>";  // -------------------【下月】按钮
	datepickerBarString += "</div>";  // -----------------------------------------------------------------------------------------时间选择插件日期范围显示栏结束
	datepickerBarString += "<div class='datepicker-plugin'>";  // ---------------------------------------------------------时间选择插件选择框开始	
	datepickerBarString += pluginHead;  // -------------------------------------------------------------------------------------时间选择插件选择框 head
	datepickerBarString += "<div class='datepicker-plugin-body'>";  // --------------------------------------------------时间选择插件选择框 body 开始
	datepickerBarString += "<div class='datepicker-plugin-body-custom' style='display: none;'>";  // -----------【自定义选择】开始
	datepickerBarString += "<div class='datepicker-plugin-body-custom-selector'>";  // ----------------------------【自定义选择】左侧选择按钮开始
	datepickerBarString += "<div class='datepicker-plugin-body-custom-selector-text'>自定义</div>";  // -------选择按钮上显示文字的 div
	datepickerBarString += "<div class='datepicker-plugin-body-custom-selector-list' unselectable='on'>";  // 下拉框开始
	datepickerBarString += "<ul><li class='liselected'>自定义</li><li>本周</li><li>上周</li><li>本月</li><li>上月</li><li>本季</li><li>上季</li><li>今年</li><li>去年</li><li>近7天</li><li>近30天</li></ul>";  // 下拉框选项
	datepickerBarString += "</div></div>";  // ---------------------------------------------------------------------------------下拉框结束，【自定义选择】左侧选择按钮结束
	datepickerBarString += "<div class='datepicker-plugin-body-custom-dateranger input-daterange input-group'>";  // -----------------bootstrap-datepicker 开始
	datepickerBarString += "<input type='text' class='input-sm form-control' name='start' />";  // ---------------------------------------------bootstrap-datepicker 开始日期
	datepickerBarString += "<span class='input-group-addon'>至</span>";  // ----------------------------------------------------------------------bootstrap-datepicker “至”
	datepickerBarString += "<input type='text' class='input-sm form-control' name='end' />";  // ----------------------------------------------bootstrap-datepicker 结束日期
	datepickerBarString += "</div></div>";  // ---------------------------------------------------------------------------------------------------------------bootstrap-datepicker 结束，【自定义选择】结束
	datepickerBarString += "<div class='datepicker-plugin-body-month' style='display: none;'></div>";  // -------------【按月选择】
	datepickerBarString += "<div class='datepicker-plugin-body-week' style='display: none;'>";  // ----------------------【按投放周选择】开始
	datepickerBarString += "<div class='datepicker-plugin-body-week-calendar'></div>";  // ------------------------------左侧月份选择插件
	datepickerBarString += "<div class='datepicker-plugin-body-week-selector'>";  // ---------------------------------------右侧下拉选项列表开始
	datepickerBarString += "<div class='datepicker-plugin-body-week-selector-text'>请首先选择月份</div>";  // ----------右侧下拉选项列表结果显示框
	datepickerBarString += "<div class='datepicker-plugin-body-week-selector-list' unselectable='on'><ul><li>请首先选择月份</li></ul></div>";  // --------------右侧下拉选项列表
	datepickerBarString += "</div></div></div>";  // ---------------------------------------------------------------------------------右侧下拉选项列表结束，【按投放周选择】结束，时间选择插件选择框 body 结束
	datepickerBarString += "<div class='datepicker-plugin-foot'>";  // ---------------------------------------------------时间选择插件选择框 foot 开始
	datepickerBarString += "<div class='datepicker-plugin-foot-confirm' unselectable='on'>确&nbsp;&nbsp;&nbsp;认</div>"; // 时间选择插件选择框 foot 中的【确定】按钮
	datepickerBarString += "</div></div>";  // --------------------------------------------------------------------------------时间选择插件选择框 foot 结束，时间选择插件选择框结束
	
	$thisDatepicker.append(datepickerBarString);  // 将生成好的内容插入到类名为“datepicker-bar”的 div 中
	if (!$('head').hasClass("havingBSDPquote")) {  // 判断页面是否已经引用 bootstrap-datepicker.js 文件
		// 引用 bootstrap-datepicker 的 js 文件
		$('head').append("<script src='../js/bootstrap-datepicker.js'></script><script src='../js/locales/bootstrap-datepicker.zh-CN.js'></script>");
		$('head').addClass("havingBSDPquote");
	}
	
	var $daterangerObj = $thisDatepicker.find('.datepicker-plugin-body-custom-dateranger'),  // 日期范围选择对象
		  $monthObj = $thisDatepicker.find('.datepicker-plugin-body-month'),  // 月份选择对象
		  $weekCanlendar = $thisDatepicker.find('.datepicker-plugin-body-week-calendar'),  // 【按投放周选择】左侧月份选择日历
		  $inputStart = $('input[name="start"]', $daterangerObj),
		  $inputEnd = $('input[name="end"]', $daterangerObj);
		  
	// 设置日期范围显示栏内的日期范围函数
	var setDisplayDaterange = function($this, sd, ed) {
		// 注意在调用这个函数之后，要修改变量 displayMonth
		var sdArray = sd.split('-'),
			edArray = ed.split('-'),
			sdString = sdArray[0] + "年" + sdArray[1] + "月" + sdArray[2] + "日",
			edString = edArray[0] + "年" + edArray[1] + "月" + edArray[2] + "日";

		$this.find('.dpstart').val(sdArray[0] + sdArray[1] + sdArray[2]).html(sdString);
		$this.find('.dpend').val(edArray[0] + edArray[1] + edArray[2]).html(edString);
	};
	
	// 【按投放周选择】标签中点击下拉选项中的某一个选项时的点击事件
	var weekSelectorLiClickEvent = function() {
		$thisDatepicker.find('.datepicker-plugin-body-week-selector-list li').click(function() {
			var $this = $(this);
			$this.siblings('li').removeClass('liselected');
			$this.addClass('liselected');
			$this.parents('.datepicker-plugin-body-week-selector-list').prev().text($this.text()).val($this.attr('range-value'));
		});
	};
	
	// bootstrap-datepicker 时间选择插件初始化函数
	var datepickerInit = function() {
		// 【自定义选择】标签中的时间范围选择插件
		$daterangerObj.datepicker({
			language: "zh-CN",
			format: "yyyy-mm-dd",
			todayHighlight: true,
			maxViewMode: 2,
			todayBtn: "linked",
			autoclose: true,
			orientation: "bottom auto"
		});
		// 【按月选择】标签中的时间选择插件
		$monthObj.datepicker({
			language: "zh-CN",
			format: "yyyy-mm",
			minViewMode: 1,
			maxViewMode: 2,
			defaultViewDate: monthSelectorOptions
		});
		//【按投放周选择】左侧月份选择日历
		$weekCanlendar.datepicker({
			language: "zh-CN",
			format: "yyyy-mm",
			minViewMode: 1,
			maxViewMode: 2
		}).on({
			'changeDate': function() {
				$thisDatepicker.find('.datepicker-plugin-body-week-selector-list').hide();
				$thisDatepicker.find('.datepicker-plugin-body-week-selector-text').text("请选择投放周").val("");
				$thisDatepicker.find('.datepicker-plugin-body-week-selector-list ul').remove();
				var pickedMonthArray = $thisDatepicker.find('.datepicker-plugin-body-week-calendar').datepicker('getFormattedDate').split('-'),
					  curYear = pickedMonthArray[0],
					  curMonth = parseInt(pickedMonthArray[1]),
					  curMonth = curMonth < 10 ? ('0' + curMonth) : curMonth,
					  ajaxData = curYear + curMonth;
				$.ajax({
					type: "post",
					data: {"month": ajaxData},
					url: parameters.ajaxURL,
					async: true,
					cache: false,
					dataType: "json",
					success: function(data) {
						var ulString = "<ul>";
						for (var i = 0; i < data.length; i++) {
							var curWeekName = data[i].WEEK_NAME,
								  curStartMonth = parseInt(data[i].BEGIN_DATE.split('-')[1]),
								  curStartDate = parseInt(data[i].BEGIN_DATE.split('-')[2]),
								  curEndMonth = parseInt(data[i].END_DATE.split('-')[1]),
								  curEndDate = parseInt(data[i].END_DATE.split('-')[2]);
							ulString += ("<li range-value='" + data[i].BEGIN_DATE + ":" + data[i].END_DATE +"'>" +
											  curWeekName.substring(curWeekName.indexOf("第"), curWeekName.indexOf("周") + 1) +
											  "(" + curStartMonth + "." + curStartDate + "-" + curEndMonth + "." + curEndDate + ")</li>");
						}
						ulString += "</ul>";
						$thisDatepicker.find('.datepicker-plugin-body-week-selector-list').html(ulString);
						weekSelectorLiClickEvent();  // 设置下拉选项的点击事件
					}
				});
			},
			'changeYear': function() {
				$thisDatepicker.find('.datepicker-plugin-body-week-selector-list').hide();
			}
		});
	};
	
	// 初始化数据方法
	var initData = function() {
		$thisDatepicker.find('.datepicker-plugin-head-items').css('width', 110 * itemNumber); // 根据 head 中的选择项的数目来确定选择项的宽度
		$thisDatepicker.css('width', parameters.width + 'px');
		$thisDatepicker.find('.datepicker-display').css('width', parameters.width + 'px');
		$thisDatepicker.find('.datepicker-plugin').css('width', parameters.width + 'px');
		$thisDatepicker.find('.dprange').css('width', (parameters.width - 60) + 'px');
		$thisDatepicker.find('.dpstart').css('width', ((parameters.width - 160) / 2) + 'px');
		$thisDatepicker.find('.dpend').css('width', ((parameters.width - 160) / 2) + 'px');
		$thisDatepicker.find('.datepicker-plugin-body-custom-selector').css('margin-left', ((parameters.width - 345) / 2 - 3) + 'px');
		$thisDatepicker.find('.datepicker-plugin-body-week-calendar').css('margin-left', ((parameters.width - 380) / 2) + 'px');
		if (parameters.customSelector == false) {
			$thisDatepicker.find(".datepicker-plugin-body-custom").remove();
		}
		if (parameters.monthSelector == false) {
			$thisDatepicker.find(".datepicker-plugin-body-month").remove();
		}
		if (parameters.weekSelector == false) {
			$thisDatepicker.find(".datepicker-plugin-body-week").remove();
		}
		switch(firstItem) {
			case 1: {
				$thisDatepicker.find('.datepicker-plugin-head-items-custom').addClass("clicked");
				$thisDatepicker.find('.datepicker-plugin-body-custom').css('display', 'block');
				$thisDatepicker.find('.datepicker-plugin-foot-confirm').addClass('custom');
			}
			break;
			case 2: {
				$thisDatepicker.find('.datepicker-plugin-head-items-month').addClass("clicked");
				$thisDatepicker.find('.datepicker-plugin-body-month').css('display', 'block');
				$thisDatepicker.find('.datepicker-plugin-foot-confirm').addClass('month');
			}
			break;
			case 3: {
				$thisDatepicker.find('.datepicker-plugin-head-items-week').addClass("clicked");
				$thisDatepicker.find('.datepicker-plugin-body-week').css('display', 'block');
				$thisDatepicker.find('.datepicker-plugin-foot-confirm').addClass('week');
			}
			break;
			default: break;
		}
		// 初始化自定义开始日期
		if (parameters.defaultCustomStart == "" || parameters.defaultCustomStart == null || parameters.defaultCustomStart == "undefined") {
			$inputStart.datepicker('setDate', dateString);  // 初始化开始日期为今天
		} else {
			var y = parseInt(parameters.defaultCustomStart.substring(0, 4)),
				  m = parseInt(parameters.defaultCustomStart.substring(4, 6)),
				  d = parseInt(parameters.defaultCustomStart.substring(6, 8));
			$inputStart.datepicker('setDate', formatDate(y, m, d));  // 初始化结束日期为自定义日期
		}
		// 初始化自定义结束日期
		if (parameters.defaultCustomEnd == "" || parameters.defaultCustomEnd == null || parameters.defaultCustomEnd == "undefined") {
			$inputEnd.datepicker('setDate', dateString);  // 初始化结束日期为今天
		} else {
			var y = parseInt(parameters.defaultCustomEnd.substring(0, 4)),
				  m = parseInt(parameters.defaultCustomEnd.substring(4, 6)),
				  d = parseInt(parameters.defaultCustomEnd.substring(6, 8));
			$inputEnd.datepicker('setDate', formatDate(y, m, d));  // 初始化结束日期为自定义日期
		}
		if (parameters.defaultDisplayStart) {
			var defaultDS = parameters.defaultDisplayStart.substring(0, 4) + "-" + parameters.defaultDisplayStart.substring(4, 6) + "-" + parameters.defaultDisplayStart.substring(6, 8);
			if (parameters.defaultDisplayEnd) {
				var defaultDE = parameters.defaultDisplayEnd.substring(0, 4) + "-" + parameters.defaultDisplayEnd.substring(4, 6) + "-" + parameters.defaultDisplayEnd.substring(6, 8);
				setDisplayDaterange($thisDatepicker, defaultDS, defaultDE);
				displayMonth = new Date(parseInt(defaultDE.split('-')[0]), parseInt(defaultDE.split('-')[1]), 0);
			} else {
				setDisplayDaterange($thisDatepicker, defaultDS, defaultDS);
				displayMonth = new Date(parseInt(defaultDS.split('-')[0]), parseInt(defaultDS.split('-')[1]), 0);
			}
		} else if (parameters.defaultDisplayEnd) {
			var defaultDE = parameters.defaultDisplayEnd.substring(0, 4) + "-" + parameters.defaultDisplayEnd.substring(4, 6) + "-" + parameters.defaultDisplayEnd.substring(6, 8);
			setDisplayDaterange($thisDatepicker, defaultDE, defaultDE);
			displayMonth = new Date(parseInt(defaultDE.split('-')[0]), parseInt(defaultDE.split('-')[1]), 0);
		} else {
			setDisplayDaterange($thisDatepicker, formatDate(todayYear, todayMonth, 1), formatDate(todayYear, todayMonth, currentMonth.getDate())); // 初始化日期范围显示栏为当前月份
		}
	}
	
	// 点击事件初始化函数
	var clickEventInit = function() {
		// 【上月】按钮点击事件
		$thisDatepicker.find('.datepicker-display-prevmonth').click(function() {
			var displayY = displayMonth.getFullYear(),
				  displayM = displayMonth.getMonth(),
				  displayD = displayMonth.getDate();
			prevM = new Date(displayY, displayM, 0);
			setDisplayDaterange($thisDatepicker, formatDate(prevM.getFullYear(), prevM.getMonth() + 1, 1), formatDate(prevM.getFullYear(), prevM.getMonth() + 1, prevM.getDate()));
			displayMonth = new Date(prevM.getFullYear(), prevM.getMonth(), prevM.getDate());
		});
		// 【下月】按钮点击事件
		$thisDatepicker.find('.datepicker-display-nextmonth').click(function() {
			var displayY = displayMonth.getFullYear(),
				  displayM = displayMonth.getMonth(),
				  displayD = displayMonth.getDate();
			nextM = new Date(displayY, displayM + 2, 0);
			setDisplayDaterange($thisDatepicker, formatDate(nextM.getFullYear(), nextM.getMonth() + 1, 1), formatDate(nextM.getFullYear(), nextM.getMonth() + 1, nextM.getDate()));
			displayMonth = new Date(nextM.getFullYear(), nextM.getMonth(), nextM.getDate());
		});
		// display-daterange 点击显示或隐藏时间选择插件事件
		$thisDatepicker.find('.datepicker-display-daterange').click(function() {
			$('.datepicker-plugin-body-custom-selector-list').hide();
			$('.datepicker-bar[id!="' + $thisDatepicker.attr("id") + '"]').find('.datepicker-plugin').hide();
			$(this).parent('.datepicker-display').siblings('.datepicker-plugin').toggle();
		});
		// head 中的选择项的点击切换标签事件
		$thisDatepicker.find('.datepicker-plugin-head-items div').click(function() {
			var $this = $(this);
			if($this.hasClass('clicked')) {
				return;
			}
			var itemName = $this.attr("class").split("-")[4];
			var bodyClassName = '.datepicker-plugin-body-' + itemName;
			$thisDatepicker.find('.datepicker-plugin-head-items div').removeClass("clicked");
			$this.addClass("clicked");
			$thisDatepicker.find('.datepicker-plugin-body > div').hide();
			$thisDatepicker.find(bodyClassName).css('display', 'block');
			$this.parents('.datepicker-plugin-head').siblings('.datepicker-plugin-foot').find('.datepicker-plugin-foot-confirm').removeClass('custom month week').addClass(itemName);
		});
		// 【自定义选择】标签中下拉选项的点击事件
		$thisDatepicker.find('.datepicker-plugin-body-custom-selector').click(function() {
			$(this).children('.datepicker-plugin-body-custom-selector-list').toggle();
		});
		// 【按投放周选择】右侧下拉选项的点击事件
		$thisDatepicker.find('.datepicker-plugin-body-week-selector').click(function() {
			$(this).children('.datepicker-plugin-body-week-selector-list').toggle();
		});
		$thisDatepicker.find('.datepicker-plugin').click(function(e) {
			e.stopPropagation(); // 点击时间选择插件内部时，停止事件冒泡
			if(!$(e.target).hasClass('datepicker-plugin-body-custom-selector-text')) {
				$(this).find('.datepicker-plugin-body-custom-selector-list').hide(); // 【自定义选择】下拉选项列表之外的点击事件
			}
			if(!$(e.target).hasClass('datepicker-plugin-body-week-selector-text')) {
				$(this).find('.datepicker-plugin-body-week-selector-list').hide(); // 【按投放周选择】下拉选项列表之外的点击事件
			}
		});
		$(document).click(function(e) {
			var $clickedTarget = $(e.target);
			if(!$clickedTarget.hasClass('datepicker-plugin')) { // 【时间选择插件】之外鼠标点击事件
				if(!$clickedTarget.hasClass('datepicker-display-daterange')) {
					$('.datepicker-plugin').hide();
					$('.datepicker-plugin-body-custom-selector-list').hide();
					$('.datepicker-plugin-body-week-selector-list').hide();
				}
			}
		});
		// 【自定义选择】标签中点击下拉选项中的某一个选项时的点击事件
		$thisDatepicker.find('.datepicker-plugin-body-custom-selector-list li').click(function() {
			var $this = $(this);
			$this.siblings('li').removeClass('liselected');
			$this.addClass('liselected');
			$this.parents('.datepicker-plugin-body-custom-selector-list').prev().text($(this).text());
			switch($this.text()) {
				case '本周':
					{
						var thisMonday = new Date(nowTime - (todayWeekDay - 1) * oneDayLong), // 本周一
							thisSunday = new Date(nowTime + (7 - todayWeekDay) * oneDayLong), // 本周日
							thisMondayString = formatDate(thisMonday.getFullYear(), thisMonday.getMonth() + 1, thisMonday.getDate()), // 格式化日期
							thisSundayString = formatDate(thisSunday.getFullYear(), thisSunday.getMonth() + 1, thisSunday.getDate()); // 格式化日期
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', thisMondayString);
						$inputEnd.datepicker('setDate', thisSundayString);
					};
					break;
				case '上周':
					{
						var lastMonday = new Date(nowTime - (todayWeekDay - 1) * oneDayLong - oneDayLong * 7), // 上周一
							lastSunday = new Date(nowTime + (7 - todayWeekDay) * oneDayLong - oneDayLong * 7), // 上周日
							lastMondayString = formatDate(lastMonday.getFullYear(), lastMonday.getMonth() + 1, lastMonday.getDate()), // 格式化日期
							lastSundayString = formatDate(lastSunday.getFullYear(), lastSunday.getMonth() + 1, lastSunday.getDate()); // 格式化日期
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', lastMondayString);
						$inputEnd.datepicker('setDate', lastSundayString);
					};
					break;
				case '本月':
					{
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', formatDate(todayYear, todayMonth, 1));
						$inputEnd.datepicker('setDate', formatDate(todayYear, todayMonth, currentMonth.getDate()));
					};
					break;
				case '上月':
					{
						var lastMonth = new Date(todayYear, todayMonth - 1, 0);
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', formatDate(todayYear, todayMonth - 1, 1));
						$inputEnd.datepicker('setDate', formatDate(todayYear, todayMonth - 1, lastMonth.getDate()));
					};
					break;
				case '本季':
					{
						var thisQuarterStart, thisQuarterEnd;
						switch(todayMonth) {
							case 1, 2, 3:
								{
									thisQuarterStart = 1;
									thisQuarterEnd = 3;
								};
								break;
							case 4, 5, 6:
								{
									thisQuarterStart = 4;
									thisQuarterEnd = 6;
								};
								break;
							case 7, 8, 9:
								{
									thisQuarterStart = 7;
									thisQuarterEnd = 9;
								};
								break;
							case 10, 11, 12:
								{
									thisQuarterStart = 10;
									thisQuarterEnd = 12;
								};
								break;
							default:
								break;
						};
						var thisQuarterEndDate = new Date(todayYear, thisQuarterEnd, 0);
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', formatDate(todayYear, thisQuarterStart, 1));
						$inputEnd.datepicker('setDate', formatDate(todayYear, thisQuarterEnd, thisQuarterEndDate.getDate()));
					};
					break;
				case '上季':
					{
						var lastQuarterStart,
							lastQuarterEnd,
							lastQuarterYear = todayYear;
						switch(todayMonth) {
							case 1, 2, 3:
								{
									lastQuarterStart = 10;
									lastQuarterEnd = 12;
									lastQuarterYear--;
								};
								break;
							case 4, 5, 6:
								{
									lastQuarterStart = 1;
									lastQuarterEnd = 3;
								};
								break;
							case 7, 8, 9:
								{
									lastQuarterStart = 4;
									lastQuarterEnd = 6;
								};
								break;
							case 10, 11, 12:
								{
									lastQuarterStart = 7;
									lastQuarterEnd = 9;
								};
								break;
							default:
								break;
						};
						var lastQuarterEndDate = new Date(lastQuarterYear, lastQuarterEnd, 0);
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', formatDate(lastQuarterYear, lastQuarterStart, 1));
						$inputEnd.datepicker('setDate', formatDate(lastQuarterYear, lastQuarterEnd, lastQuarterEndDate.getDate()));
					};
					break;
				case '今年':
					{
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', formatDate(todayYear, 1, 1));
						$inputEnd.datepicker('setDate', formatDate(todayYear, 12, 31));
					};
					break;
				case '去年':
					{
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', formatDate(todayYear - 1, 1, 1));
						$inputEnd.datepicker('setDate', formatDate(todayYear - 1, 12, 31));
					};
					break;
				case '近7天':
					{
						var sevenDaysBefore = new Date(nowTime - 6 * oneDayLong), // 七天前的日期
							sevenDaysBeforeString = formatDate(sevenDaysBefore.getFullYear(), sevenDaysBefore.getMonth() + 1, sevenDaysBefore.getDate()); // 格式化日期
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', sevenDaysBeforeString);
						$inputEnd.datepicker('setDate', formatDate(todayYear, todayMonth, todayDate));
					};
					break;
				case '近30天':
					{
						var thirtyDaysBefore = new Date(nowTime - 29 * oneDayLong), // 三十天前的日期
							thirtyDaysBeforeString = formatDate(thirtyDaysBefore.getFullYear(), thirtyDaysBefore.getMonth() + 1, thirtyDaysBefore.getDate()); // 格式化日期
						checkLiIsClicked = true;
						$inputStart.datepicker('setDate', thirtyDaysBeforeString);
						$inputEnd.datepicker('setDate', formatDate(todayYear, todayMonth, todayDate));
					};
					break;
				default:
					break;
			}
			checkLiIsClicked = false;
		});
		$('input', $daterangerObj).change(function() {
			if(checkLiIsClicked == true) {
				return;
			} else {
				$(this).parents('.datepicker-plugin-body-custom').find('.datepicker-plugin-body-custom-selector-text').text('自定义');
				$(this).parents('.datepicker-plugin-body-custom').find('.datepicker-plugin-body-custom-selector-list li:first').siblings('li').removeClass('liselected');
				$(this).parents('.datepicker-plugin-body-custom').find('.datepicker-plugin-body-custom-selector-list li:first').addClass('liselected');
			}
		});
		// foot 中的确定按钮的鼠标按下事件
		$thisDatepicker.find('.datepicker-plugin-foot-confirm').mousedown(function() {
			var $this = $(this);
			$this.css('background-color', '#EEEEEE');
			$this.on({
				mouseout: function() { $this.css('background-color', '#FFFFFF'); },
				mouseover: function() { $this.css('background-color', '#EEEEEE'); }
			});
		});
		// 当鼠标抬起时，取消 foot 中确定按钮的效果的事件
		$(document).mouseup(function() {
			$('.datepicker-plugin-foot-confirm').off('mouseout mouseover');
		});
		// foot 中的确定按钮的鼠标抬起事件
		$thisDatepicker.find('.datepicker-plugin-foot-confirm').mouseup(function() {
			var $this = $(this);
			$this.css('background-color', '#FFFFFF');
			if($this.hasClass('custom')) {
				var inputFirstVal = $thisDatepicker.find('.datepicker-plugin-body-custom-dateranger input:first').val(),
					inputLastVal = $thisDatepicker.find('.datepicker-plugin-body-custom-dateranger input:last').val(),
					inputFirstValArray = inputFirstVal.split('-'),
					inputLastValArray = inputLastVal.split('-');
				if (inputFirstValArray[0] == "" || inputFirstValArray[0] == null || inputFirstValArray[0] == "undefined" ||
				inputFirstValArray[1] == "" || inputFirstValArray[1] == null || inputFirstValArray[1] == "undefined" ||
				inputFirstValArray[2] == "" || inputFirstValArray[2] == null || inputFirstValArray[2] == "undefined" ||
				inputLastValArray[0] == "" || inputLastValArray[0] == null || inputLastValArray[0] == "undefined" ||
				inputLastValArray[1] == "" || inputLastValArray[1] == null || inputLastValArray[1] == "undefined" ||
				inputLastValArray[2] == "" || inputLastValArray[2] == null || inputLastValArray[2] == "undefined") {
					alert("时间范围未知，请选择！");
					return;
				}
				if (inputFirstValArray[0] > inputLastValArray[0]) {
					alert("开始时间不能大于结束时间，请检查！");
					return;
				} else if (inputFirstValArray[0] == inputLastValArray[0]) {
					if (inputFirstValArray[1] > inputLastValArray[1]) {
						alert("开始时间不能大于结束时间，请检查！");
						return;
					} else if (inputFirstValArray[1] == inputLastValArray[1]) {
						if (inputFirstValArray[2] > inputLastValArray[2]) {
							alert("开始时间不能大于结束时间，请检查！");
							return;
						}
					}
				}
				setDisplayDaterange($thisDatepicker, inputFirstVal, inputLastVal);
				displayMonth = new Date(inputLastValArray[0], inputLastValArray[1], 0);
			} else if($this.hasClass('month')) {
				var pickedDateArray = $this.parents('.datepicker-plugin').find('.datepicker-plugin-body-month').datepicker('getFormattedDate').split('-');
				if (pickedDateArray[0] == "" || pickedDateArray[0] == null || pickedDateArray[0] == "undefined" || 
				pickedDateArray[1] == "" || pickedDateArray[1] == null || pickedDateArray[1] == "undefined") {
					alert("未选中月份，请检查！");
					return;
				}
				var curYear = parseInt(pickedDateArray[0]),
					  curMonth = parseInt(pickedDateArray[1]),
					  pickedDateString = new Date(curYear, curMonth, 0),
					  curStartDate = formatDate(curYear, curMonth, 1);
				curEndDate = formatDate(curYear, curMonth, pickedDateString.getDate());
				setDisplayDaterange($thisDatepicker, curStartDate, curEndDate);
				displayMonth = pickedDateString;
			} else if($this.hasClass('week')) {
				var daterangeArray = $thisDatepicker.find('.datepicker-plugin-body-week-selector-text').val().split(':');
				if (daterangeArray == "" || daterangeArray.length == 0 || daterangeArray == null || daterangeArray == "undefined") {
					alert("未选择投放周，请检查！");
					return;
				}
				setDisplayDaterange($thisDatepicker, daterangeArray[0], daterangeArray[1]);
				displayMonth = new Date(parseInt(daterangeArray[1].split('-')[0]), parseInt(daterangeArray[1].split('-')[1]), 0);
			}
			$this.parents('.datepicker-plugin').hide();
		});
	};
	
	var init = function() {
		datepickerInit();
		initData();
		clickEventInit();
	}
	init();
};
jQuery.fn.getDaterange = function() {
	var $this = $(this),
		  returnArray = [];
	returnArray[0] = $this.find('.dpstart').val();
	returnArray[1] = $this.find('.dpend').val();
	return returnArray;
};