jQuery.v6datepicker = function(parameters) {
	
	// 变量声明
	
	var formatDate = function(y, m, d) {
		y = y;
		m = m + 1 < 10 ? ('0' + (m + 1)) : m + 1;
		d = d < 10 ? ('0' + d) : d;
		return y + '-' + m + '-' + d;
	};
	
	if (parameters.customSelector == true) {
		itemNumber++;
	}
	if (parameters.monthSelector == true) {
		itemNumber++;
	}
	if (parameters.weekSelector == true) {
		itemNumber++;
	}
	if (itemNumber == 0) {
		alert("无法生成日期选择插件，错误原因：无选择项！");
		return;
	}
}