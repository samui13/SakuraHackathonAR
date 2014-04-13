/**
 * Copyright 2013-2014 FUJITSU LIMITED
 */
 
/**
 * 業務アプリサンプルのライブラリ空間です。
 */
var Apl = {};

/** 使用するシナリオIDです。 */
Apl.useScenarioId = 1;


/**
 * 動作モードを保持します。
 * Webストレージ保存対象です。
 */
Apl.operationMode;

/** 
 * シナリオリストを保持します。 
 * Webストレージ保存対象です。
 */
Apl.scenarioList = null;

/** 
 * シナリオIDを保持します。 
 * Webストレージ保存対象です。
 */
Apl.scenarioId = null;

/** 
 * シーンリストを保持します。 
 * Webストレージ保存対象です。
 */
Apl.sceneList = null;

/** 
 * 現在のシーンIDを保持します。
 * Webストレージ保存対象です。
 */
Apl.sceneId = 1;

/** 
 * シーン、マーカー別にAR重畳表示定義データを保持します。 
 * Webストレージ保存対象です。
 */
Apl.superimposedGraphics = null;

/** 
 * 点検値入力時のAR実行サーバに送信するデータです。 
 * Webストレージ保存対象です。
 */
Apl.postData = null;

/** 
 * 最新の点検値データを保持します。
 * Webストレージ保存対象です。
 */
Apl.userData = null;

/** マーカー検知に登録したリスナーID */
Apl.listenerId = "";

/** 複数ダウンロード実行時の終了判定に使用 */
Apl.completionNotice = new Object();
Apl.completionNotice.notice = false; //trueなら終了通知
Apl.completionNotice.count = 0; //ダウンロード実行回数。0になったら終了

/** AR実行サーバのQuadを表現するクラスです。データの登録時に使用します。 */
Apl.Quad = function(){
	this.qtypeName;
	this.id;
	this.qvalues;
	this.version;
	return this;
};

/** AR実行サーバのQValueを表現するクラスです。データの登録時に使用します。*/
Apl.QValue = function(){
	this.qtypeName;
	this.qentityId;
	this.qattributeName;
	this.stringValue;
	this.longValue;
	this.floatValue;
	this.version;
	return this;
};

/** AR実行サーバのquad検索のクエリを表現するクラスです。 */
Apl.QuadQuery = function(){
	this.type;
	this.limitRange;
	this.qattributeOrderIndexRange;
	this.qtypeNameRages;
	this.whereExpressions;
	this.sortOrderExpressions;
	return this;
};

/**
 * AR実行サーバのquad検索クエリの範囲を表現するクラスです。 
 * コンストラクタでendを省略するとstartと同じ値が格納されます。
 */
Apl.Range = function(_start, _end){
	this.start = _start;
	if(typeof _end == "undefined") this.end = _start;
	else this.end = _end;
	return this;
};

/** AR実行サーバのquad検索クエリのExpressionを表現するクラスです。 */
Apl.QuadQueryExpression = function(_nameRange, _valueRange, _type, _desc){
	this.qattributeNameRanges = _nameRange;
	this.qvalueRanges = _valueRange;
	this.qvalueType = _type;
	this.desc = _desc;
	return this;
};

/** QuadQueryクラスからquad検索文字列を生成します。 */
Apl.makeQuadQuery = function(_qQuery){
	var query="quads?";
	if(_qQuery == null) return query;
	if(_qQuery.type != null) query += "type=" + _qQuery.type;
	if(_qQuery.limitRange != null) query += "&limitRange=" + JSON.stringify(_qQuery.limitRange);
	if(_qQuery.qattributeOrderIndexRange != null) query += "&qattributeOrderIndexRange=" + JSON.stringify(_qQuery.qattributeOrderIndexRange);
	if(_qQuery.qtypeNameRanges != null) query += "&qtypeNameRanges=" + JSON.stringify(_qQuery.qtypeNameRanges);
	if(_qQuery.whereExpressions != null) query += "&whereExpressions=" + JSON.stringify(_qQuery.whereExpressions);
	if(_qQuery.sortOrderExpressions != null) query += "&sortOrderExpressions=" + JSON.stringify(_qQuery.sortOrderExpressions);
	return query;
};

/** 何もしないメソッドです。 */
Apl.noop = function(_result){};

/** WebStorageに保存した全てのデータを取得します。 */ 
Apl.getLocalStorageData = function(){
	
	//動作モードの取得
	if(localStorage.getItem("operationMode") != null)
		Apl.operationMode = localStorage.getItem("operationMode");
	//シナリオリストの取得
	if(localStorage.getItem("scenarioList") != null)
		Apl.scenarioList = JSON.parse(localStorage.getItem("scenarioList"));
	//現在のシナリオIDの取得
	if(localStorage.getItem("scenarioId") != null)
		Apl.scenarioId = parseInt(localStorage.getItem("scenarioId"));
	//シーンリストの取得
	if(localStorage.getItem("sceneList") != null )
		Apl.sceneList = JSON.parse(localStorage.getItem("sceneList"));
	//現在のシーンIDの取得
	if(localStorage.getItem("sceneId") != null)
		Apl.sceneId = parseInt(localStorage.getItem("sceneId"));
	//AR重畳表示定義データの取得
	if(localStorage.getItem("ARContents") != null)
		Apl.superimposedGraphics = AR.Renderer.parseSuperimposedGraphic(localStorage.getItem("ARContents"));
	//利用者定義データの取得
	if(localStorage.getItem("userData") != null)
		Apl.userData = JSON.parse(localStorage.getItem("userData"));
	//未登録データの取得
	if(localStorage.getItem("postData") != null)
		Apl.postData = JSON.parse(localStorage.getItem("postData"));
};

/** エラーログを出力します。 */ 
Apl.log = function(_message, _detail){
	if(_message == null) return;
	var code = 0;
	var message;
	
	if(_message instanceof Error){ //Errorオブジェクトの場合
		if(typeof _message.code == 'number') code = _message.code;
		message = _message.componentName == null ? _message.toString() : _message.componentName + " : " + _message.toString();
		if(_message.cause != null) message += " Cause : "+_message.cause; 
	} else message = _message.toString(); //それ以外の場合
	//messageはアラートで表示します。
	alert(message);
	//message + detailをログに出力します。
	if(_detail) message +="\n" + _detail;
	try{
		AR.Log.log(AR.Log.LevelType.ERROR,code,message,Apl.noop, Apl.logError);
	} catch(e){
			alert("ログの出力に失敗しました。"+e);
	}
};

/** ログ出力のonErrorに設定するコールバック関数です。 */
Apl.logError = function(_result){
	alert("ログの出力に失敗しました。\n" + result.getStatus() + "\n"+ _result.getValue());
};

/**
 * ネイティブカメラ起動のonErrorに設定するコールバック関数です。
 */
Apl.startCameraViewError = function(_result){
	var message = "ネイティブカメラの起動に失敗しました。";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** ネイティブカメラ停止のonErrorに設定するコールバック関数です。 */
Apl.stopCameraViewError = function(_result){
	var message = "ネイティブカメラの停止に失敗しました。";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** マーカー検知登録のonErrorに設定するコールバック関数です。*/
Apl.addMarkerListenerError = function(_result){
	var message ="マーカー検知のイベントリスナ登録に失敗しました。";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** マーカー検知削除のonErrorに設定するコールバック関数です。 */
Apl.removeMarkerListenerError = function(_result){
	var message = "マーカー検知のイベントリスナ削除に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** マーカー情報取得のonErrorに設定するコールバック関数です。 */
Apl.getCurrentMarkersError = function(_result){
	var message = "マーカー情報の取得に失敗しました。";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** オフラインストレージ設定のonErrorに設定するコールバック関数です。 */
Apl.useOfflineStorageError = function(_result){
	var message = "オフラインストレージの設定に失敗しました。";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** 
 * AR実行サーバからデータ取得のonErrorに設定するコールバック関数です。 
 * ネイティブでHTTP例外が発生した場合は結果オブジェクトのvalueの形式が異なります。
 */
Apl.getArServerDataError = function(_result){
	var message = "AR実行サーバのデータ取得に失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
	var detail;
	if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else {
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}
	Apl.log(message, detail);
};

/** AR実行サーバへのPOSTのonErrorに設定するコールバック関数です。 */
Apl.postArServerDataError = function(_result){
	var message = "AR実行サーバへのアップロードに失敗しました。動作モードとネットワーク状況を確認して再度お試しください。";
	var detail;
	if(_result.getStatus() == "AR_HTTP_EXCEPTION"){
		detail = _result.getValue().status + " : " + _result.getValue().statusText + "\n" + _result.getValue().responseText;
	} else {
		detail += _result.getStatus() + "\n"+ _result.getValue();
	}
	Apl.log(message, detail);
};

/** オフラインストレージ削除のonErrorに設定するコールバック関数です。 */
Apl.clearResourceStorageError = function(_result){
	var message = "オフラインストレージの削除に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** 動作モード取得のonErrorに設定するコールバック関数です。 */
Apl.getOperationModeError = function(_result){
	var message = "動作モードの取得に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** タップイベント通知のonErrorに設定するコールバック関数です。 */
Apl.onBodyClickError = function(_result){
	var message = "タップイベントの通知に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** AR重畳表示定義データ追加のonErrorに設定するコールバック関数です。 */
Apl.putError = function(_result){
	var message = "AR重畳表示定義データの追加に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** ARコンテンツ削除のonErrorに設定するコールバック関数です。 */
Apl.removeError = function(_result){
	var message = "ARコンテンツの削除に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/** ARコンテンツ全削除のonErrorに設定するコールバック関数です。 */
Apl.clearError = function(_result){
	var message = "ARコンテンツの全削除に失敗しました。\n";
	var detail = _result.getStatus() + "\n"+ _result.getValue();
	Apl.log(message, detail);
};

/**
 * index.htmlの画面初期化処理です。
 * ネイティブカメラの停止、Webストレージから保存したデータを取得した後、動作モードを判定します。
 */
Apl.onloadIndex = function(){
		
	// ネイティブカメラを停止させます。
	try{
		AR.Camera.stopCameraView(Apl.noop, Apl.stopCameraViewError);
	} catch (e){
		Apl.log(e);
	}
	
	//オフラインストレージをONに設定します。
	try{
		AR.Data.useOfflineStorage(true, Apl.noop,Apl.useOfflineStorageError);
	} catch (e){
		Apl.log(e);
	}
	
	//Webストレージに保存した全てのデータを取得します。
	Apl.getLocalStorageData();
			
	Apl.scenarioId = Apl.useScenarioId;
	
	//動作モードを取得してApl.operationModeに保存します。 
	try{
		AR.OS.getOperationMode(Apl.getOperationModeSuccess ,Apl.getOperationModeError);
	} catch (e){
		Apl.log(e);
	}
};

/** 取得した動作モードを変数に格納します。 */
Apl.getOperationModeSuccess = function(_result){

	//取得した動作モードを変数に格納します。
	Apl.operationMode = _result.getValue();
	localStorage.setItem("operationMode", Apl.operationMode);
	
	//動作モードに応じてhtml表示を変更します。
	Apl.showOperationMode();
	
	if(Apl.operationMode == "serverMode"){ //サーバ通信モードの場合
		//AR実行サーバからシナリオリストを取得します。
		Apl.getScenario();
	} else { //スタンドアローンモードの場合
		//シナリオボタンを表示します。
		Apl.showScenarioButton();
	}
};

/**
 * 動作モードに応じてhtmlの表示を変更します。
 */
Apl.showOperationMode = function(){
	if(Apl.operationMode == "serverMode"){
		document.getElementById("operationMode_area").innerText = "サーバ通信モード";
		document.getElementById("operationMode_area").className = "serverMode"
	} else {
		document.getElementById("operationMode_area").innerText = "スタンドアローンモード";
		document.getElementById("operationMode_area").className = "standaloneMode";
	}
};

/** 保持しているシナリオデータを使用してボタンを表示します。 */
Apl.showScenarioButton = function(){
	if(Apl.scenarioList != null && Apl.scenarioList[Apl.scenarioId] != null){
		document.getElementById("scenario_select").value = Apl.scenarioList[Apl.scenarioId].name;
		document.getElementById("scenario_select").style.visibility = "visible";
		document.getElementById("scenario_select").onclick = Apl.changePreWork;
	} else {
		alert("シナリオを取得できていません。シナリオが登録されていることや動作モードとネットワーク状態を確認してもう一度お試しください。");
	}
};

/** シナリオ取得の検索クエリを生成し、AR実行サーバからシナリオデータを取得します。 */
Apl.getScenario = function(){
	//quads検索用クエリオブジェクトを作成します。
	var query = new Apl.QuadQuery();
	query.type = "RECORDSANDCOUNT";
	query.limitRange = new Apl.Range(1,10);
	query.qattributeOrderIndexRange = new Apl.Range(1,10);
	//シナリオが登録されているqtypeを指定します。
	query.qtypeNameRanges = new Apl.Range("arscn_scenario");
	//シナリオIDを指定します。
	query.whereExpressions = new Apl.QuadQueryExpression(new Apl.Range("ar_id"), new Apl.Range(Apl.useScenarioId), "LONG");
	
	//文字列に変換します。
	query = Apl.makeQuadQuery(query);
	
	//AR実行サーバからシナリオリストを取得します。
	try{
		AR.Data.getArServerData(query, true, Apl.getScenarioSuccess, Apl.getArServerDataError);
	} catch(e){
		Apl.log(e);
	}	
};

/** AR実行サーバからシナリオ取得に成功した場合に呼ばれます。 */
Apl.getScenarioSuccess = function(_result){
	
	//初期化します
	Apl.scenarioList = null;
	//結果からシナリオを抽出してApl.scenarioListに格納します。
	Apl.extractScenario(_result.getValue());
	
	//シナリオIDをWebストレージに保存します。
		localStorage.setItem("scenarioId", Apl.scenarioId);
	//シナリオが登録されていた場合Webストレージに保存します。
	if(Apl.scenarioList != null)
		localStorage.setItem("scenarioList", JSON.stringify(Apl.scenarioList));
	
	//取得したシナリオからボタンを表示させます。
	Apl.showScenarioButton();
}; 

/** JSONオブジェクトからシナリオを抽出します。 */
Apl.extractScenario = function(_data){
	//取得したレコード数です。
	var recordLength = _data.records.length;
	
	for(var recordIndex = 0; recordIndex < recordLength; recordIndex++){
		//レコードを一つずつ調べます。
		var record = _data.records[recordIndex];
		var valueLength = record.qvalues.length;
		var scenarioId;
		var value = new Object();
		
		//使用するqvalueの値だけ取得します。attributeNameで判断します。
		for(var valueIndex = 0; valueIndex < valueLength; valueIndex++){
			var qvalue = record.qvalues[valueIndex];
			if(qvalue.qattributeName == "ar_name"){ // シナリオ名
				value.name = qvalue.stringValue;
			}
			if(qvalue.qattributeName == "ar_description"){ // シナリオの説明
				value.description = qvalue.stringValue;
			}
			if(qvalue.qattributeName == "ar_id"){ // シナリオID
				scenarioId = qvalue.longValue;
			}
		}
		
		if(value.name != null && scenarioId != null){
			//Apl.scenarioListに格納します。
			if(Apl.scenarioList == null) Apl.scenarioList = new Array();
			Apl.scenarioList[scenarioId] = value;
		}	
	}
};

/** 
 * index.htmlでデータ削除ボタンが押された場合に呼び出されます。
 * シナリオリスト、動作モード以外のWebストレージの削除、
 */
Apl.clearCache = function(){
	//Webストレージを全て削除します。
	localStorage.clear();
	if(Apl.scenarioList != null)
		//シナリオを再度Webストレージに保存します。
		localStorage.setItem("scenarioList", JSON.stringify(Apl.scenarioList));
	if(Apl.operationMode != null)
		//動作モードを再度Webストレージに保存します。
		localStorage.setItem("operationMode", Apl.operationMode);
	//オフラインストレージのデータを削除します。
	AR.Data.clearResourceStorage(Apl.clearStorageSuccess, Apl.clearResourceStorageError);
};

/** オフラインストレージの削除に成功した場合のコールバック関数です。 */
Apl.clearStorageSuccess = function(_result){
	alert("データを削除しました。");
};

/** 
 * シナリオボタンが押された時に呼ばれます。
 * prework.htmlに画面遷移します。
 */
Apl.changePreWork =function(){
	//prework.htmlへ遷移します。
	location.href = "prework.html";
};

/**
 * prework.htmlの画面初期化処理です。
 * Webストレージから保存したデータを取得した後、ネットワーク状況を判定します。
 */
Apl.onloadPreWork = function(){

	// ネイティブカメラを停止させます。
	try{
		AR.Camera.stopCameraView(Apl.noop, Apl.stopCameraViewError);
	} catch (e){
		Apl.log(e);
	}
	//Webストレージからデータを取得します。
	Apl.getLocalStorageData();
	//動作モードに応じてhtml表示を変更します。
	Apl.showOperationMode();
	//動作モードに応じてシーンを取得します。
	if(Apl.operationMode == "serverMode"){ //サーバ通信モードの場合
		
		//現在のシナリオIDのシーンリストを取得して、Apl.sceneListに格納します。
		Apl.getScene(Apl.scenarioId);
	} else { //スタンドアローンモードの場合
		//Apl.sceneListに保持しているシーンリストを表示します。
		Apl.showSceneList();
	}
};

/** シーン取得の検索クエリを生成し、AR実行サーバからデータを取得します。 */
Apl.getScene = function(_scenarioId){
	//検索クエリオブジェクトを作成します。
	var query = new Apl.QuadQuery();
	query.type = "RECORDSANDCOUNT";
	query.limitRange = new Apl.Range(1,10);
	query.qattributeOrderIndexRange = new Apl.Range(1,10);
	//シーンが登録されているqtypeを指定します。
	query.qtypeNameRanges = new Apl.Range("arsen_scene");
	//シーンidの範囲を指定します。
	query.whereExpressions = new Array(new Apl.QuadQueryExpression(new Apl.Range("ar_id"), new Apl.Range(1,4), "LONG"));
	if(typeof _scenarioId != 'undefined' )
		//シナリオIDを指定します。
		query.whereExpressions.push(new Apl.QuadQueryExpression(new Apl.Range("arscn_scenarioid"), new Apl.Range(_scenarioId), "LONG"));

	//文字列に変換します。
	query = Apl.makeQuadQuery(query);

	//AR実行サーバからシーンを取得します。
	AR.Data.getArServerData(query,true,Apl.getSceneSuccess,Apl.getArServerDataError);
};

/** AR実行サーバからシーンの取得に成功した場合のコールバック関数です。 */
Apl.getSceneSuccess = function(_result){
	//初期化します
	Apl.sceneList = null;
	//結果からシーンを抽出してApl.sceneListに格納します。
	Apl.extractScene(_result.getValue());
	//シーンが登録されていた場合はWebストレージに保存します。
	if(Apl.sceneList != null)
		localStorage.setItem("sceneList", JSON.stringify(Apl.sceneList));
	//シーンリストを表示します。
	Apl.showSceneList();
};

/** JSONオブジェクトからシーンを抽出します。 */
Apl.extractScene = function(_data){
	//取得したレコード数です。
	var recordLength = _data.records.length;
	for(var recordIndex = 0; recordIndex < recordLength; recordIndex++){
		//レコードを一つずつ調べます。
		var record = _data.records[recordIndex];
		var valueLength = record.qvalues.length;
		var value = new Object();
		var sceneId;
		//使用するqvalueの値だけ取得します。attributeNameで判断します。
		for(var valueIndex = 0; valueIndex < valueLength; valueIndex++){
			var qvalue = record.qvalues[valueIndex];
			if(qvalue.qattributeName == "ar_name"){ // シーン名
				value.name = qvalue.stringValue;
			}
			if(qvalue.qattributeName == "ar_description"){ // シーンの説明
				value.description = qvalue.stringValue;
			}
			if(qvalue.qattributeName == "ar_id"){ // シーンID
				sceneId = qvalue.longValue
			}
		}
		if(value.name != null && sceneId != null) {
			//Apl.sceneListに格納します。
			if(Apl.sceneList == null) Apl.sceneList = new Array();
			Apl.sceneList[sceneId] = value;
		}
	}
};

/** 取得したシーンリストをalertで表示します。 */
Apl.showSceneList = function(){
	if(Apl.sceneList != null){
		var show  = "【手順一覧】\n";
		for(scene in Apl.sceneList){
			if(Apl.sceneList[scene] != null)
				show += "手順"+scene+" : "+ Apl.sceneList[scene].name +"\n";
		}
		alert(show);
	} else {
		alert("シーンを取得できませんでした。シーンが登録されていることや動作モードとネットワーク状態を確認してもう一度お試しください。");
		location.href = "index.html";
	}
};

/** 作業準備ボタンが押されたときに呼ばれます。 */
Apl.resourceDownload = function(){
	if(Apl.operationMode == "serverMode"){ //サーバ通信モードの場合
		
		//ダウンロード通知を設定します。
		Apl.completionNotice.notice = true;
		Apl.completionNotice.count++;
		
		//利用者定義データを取得してApl.userDataに格納します。
		Apl.getUserData(true);
		
		//シーンごとにAR重畳表示定義データを取得してApl.superimposedGraphicsに格納します。
		//クエリとレスポンスがオフラインストレージに保存されます。
		for(scene in Apl.sceneList){
			Apl.completionNotice.count++;
			Apl.getSuperimposedGraphicData(true, new Apl.Range(Apl.scenarioId), new Apl.Range(parseInt(scene)),new Apl.Range(1));
		}
	} else { //スタンドアローンモードの場合
		alert("サーバ通信モードで実行してください。");
	}
};

/** 利用者定義データ取得の検索クエリを生成し、AR実行サーバからデータを取得します。 */
Apl.getUserData = function(_isSuperReload){
	//検索クエリオブジェクトを作成します。
	var query = new Apl.QuadQuery();
	query.type = "RECORDSANDCOUNT";
	query.limitRange = new Apl.Range(1,1);
	query.qattributeOrderIndexRange = new Apl.Range(1,10);
	//利用者定義データが登録されているqtypeを指定します。
	query.qtypeNameRanges = new Array(new Apl.Range("usr_sample"));
	//ar_idを指定します。
	query.whereExpressions = new Array(new Apl.QuadQueryExpression(new Apl.Range("ar_id"), new Apl.Range(1), "LONG"));
	//登録日時(ar_registrationtime)で降順にソートして最新のデータを取得します。
	//登録日時が0~9000000000000の範囲でソートします。
	query.sortOrderExpressions = new Array(new Apl.QuadQueryExpression(new Apl.Range("ar_registrationtime"), new Apl.Range(0,9000000000000), "LONG", true));
	//文字列に変換します。
	query = Apl.makeQuadQuery(query);
	try{
		//AR実行サーバから利用者定義データを取得します。
		AR.Data.getArServerData(query, _isSuperReload, Apl.getUserDataSuccess,Apl.getArServerDataError);
	} catch(e){
		Apl.log(e);
	}
};

/** AR実行サーバから利用者定義の取得に成功した場合に呼ばれます */
Apl.getUserDataSuccess = function(_result){
	//結果から必要なデータを抽出してApl.userDataに格納します。
	Apl.extractUserData(_result.getValue());
	//利用者定義データが登録されていた場合はWebストレージに保存します。
	if(Apl.userData != null)
		localStorage.setItem("userData", JSON.stringify(Apl.userData));
	
	//ダウンロード完了通知を判定します。
	Apl.checkCompletion();
};

/** JSONオブジェクトから利用者定義データを抽出します。 */
Apl.extractUserData = function(_data){

	//取得したレコード数です
	var recordCount = _data.records.length;
	for(var recordIndex = 0; recordIndex < recordCount; recordIndex++){
		//レコードを一つずつ調べます。
		var record = _data.records[recordIndex];
		var valueLength = record.qvalues.length;
		var value = new Object();
		//使用するqvalueの数だけ取得します。attributeNameで判断します。
		for(var valueIndex = 0; valueIndex < valueLength; valueIndex++){

			var qvalue = record.qvalues[valueIndex];
			if(qvalue.qattributeName == "usr_name"){ // 利用者名
				value.name = qvalue.stringValue;
			}
			if(qvalue.qattributeName == "usr_temperature"){ // 点検温度
				value.temperature = qvalue.longValue;
			}
			if(qvalue.qattributeName == "ar_registrationtime"){ // 登録日時
				value.time = qvalue.longValue;
			}
		} 
		//取得したデータの登録日時を比較して最新のデータをApl.userDataに格納します。
		if(value.name != null && value.temperature != null && value.time != null)
			if(Apl.userData == null || Apl.userData.time < value.time){
				Apl.userData = value;
			}
	}
};

/** ダウンロードが完了しているか確認します。*/
Apl.checkCompletion = function(){
	
	if(Apl.completionNotice.notice == true){
		Apl.completionNotice.count--;
		if(Apl.completionNotice.count == 0){
			Apl.completionNotice.notice = false;
			alert("AR重畳表示定義データをダウンロードしました");
		}
	}
};

/** AR重畳表示定義データ取得の検索クエリを生成し、AR実行サーバからデータを取得します。 */
Apl.getSuperimposedGraphicData = function(_isSuperReload, _scenarioId, _sceneId, _markerId){

	//quad検索クエリオブジェクトを作成します。
	var query = new Apl.QuadQuery();
	query.type = "RECORDSANDCOUNT";
	query.limitRange = new Apl.Range(1,10);
	query.qattributeOrderIndexRange = new Apl.Range(1,10);
	//AR重畳表示定義データが登録されているqtypeを指定します。
	query.qtypeNameRanges = new Array(new Apl.Range("arpoiarmk_default"));
	query.whereExpressions = new Array();
	
	//シナリオIDを指定します。
	if(typeof _scenarioId != 'undefined'){
		if(typeof _scenarioId == 'number' ) _scenarioId = new Apl.Range(_scenarioId);	
		query.whereExpressions.push(new Apl.QuadQueryExpression(new Apl.Range("arscn_scenarioid"), _scenarioId, "LONG"));
	}
	//シーンIDを指定します。
	if(typeof _sceneId != 'undefined'){
		if(typeof _sceneId == 'number' ) _sceneId = new Apl.Range(_sceneId);
		query.whereExpressions.push(new Apl.QuadQueryExpression(new Apl.Range("arsen_sceneid"), _sceneId, "LONG"));
	}
	//マーカーIDを指定します。
	if(typeof _markerId != 'undefined'){
		if(typeof _markerId == 'number' ) _markerId = new Apl.Range(_markerId);
		query.whereExpressions.push(new Apl.QuadQueryExpression(new Apl.Range("armk_markerid"), _markerId, "LONG"));
	}
	//文字列に変換します。
	query = Apl.makeQuadQuery(query);
		
	//AR実行サーバからAR重畳表示定義データを取得します。
	try{
		AR.Data.getArServerData(query, _isSuperReload, Apl.getSuperimposedGraphicDataSuccess,Apl.getArServerDataError);
	} catch (e){
		Apl.log(e);
	}
};

/** AR実行サーバからAR重畳表示定義データの取得に成功した場合に呼ばれます */
Apl.getSuperimposedGraphicDataSuccess = function(_result){
	//結果からAR重畳表示定義データを抽出します。
	var contents = Apl.extractSuperimposedGraphic(_result.getValue());
	
	//抽出したAR重畳表示定義データをシーンID、マーカーID別にApl.superimposedGraphicsに格納します。
	for(scene in contents){
		if(Apl.superimposedGraphics == null) Apl.superimposedGraphics = new Object();

		if(Apl.superimposedGraphics[scene] == null) {
			Apl.superimposedGraphics[scene] = contents[scene];
			//AR重畳表示定義データをネイティブAR表示層に設定します。
			Apl.setARContents(parseInt(scene));
		} else {
			for(marker in contents[scene]){
				Apl.superimposedGraphics[scene][marker] = contents[scene][marker];
				//AR重畳表示定義データをネイティブAR表示層に設定します。
				Apl.setARContents(parseInt(scene),parseInt(marker));
				
			}
		}
	}
	//AR重畳表示定義データが存在する場合はWebストレージに保存します。
	if(Apl.superimposedGraphics != null){
		localStorage.setItem("ARContents", JSON.stringify(Apl.superimposedGraphics));
	}
	//ダウンロード完了通知を確認します。
	Apl.checkCompletion();
};

/** JSONオブジェクトからAR重畳表示定義データを抽出します。 */
Apl.extractSuperimposedGraphic = function(_data){
	//取得したレコード数です。
	var recordCount = _data.records.length;
	var superimposedGraphic = new Object();
	try{
		for(var recordIndex = 0; recordIndex < recordCount; recordIndex++){
			//レコードを一つずつ調べます
			var record = _data.records[recordIndex];
			var valueLength = record.qvalues.length;
			var arName, sceneId, markerId;
			var value;
			//使用するqvalueの数だけ取得します。attributeNameで判断します。
			for(var valueIndex = 0; valueIndex < valueLength; valueIndex++){
				var qvalue = record.qvalues[valueIndex];
				if(qvalue.qattributeName == "ar_name"){ // AR重畳表示定義データ名
					arName = qvalue.stringValue;
				}
				if(qvalue.qattributeName == "arsen_sceneid"){ // シーンID
					sceneId = qvalue.longValue;
				}
				if(qvalue.qattributeName == "armk_markerid"){ // マーカーID
					markerId = qvalue.longValue;
				}
				if(qvalue.qattributeName == "arpoi_superimposedgraphic"){ // AR重畳表示定義データ
					value = AR.Renderer.parseSuperimposedGraphic(qvalue.stringValue);
				}
			}
			//AR重畳表示定義データ名、シーンID、マーカーID、AR重畳表示定義データがnullでないことを確認
			//シーンID、マーカーID、AR重畳表示定義データは重畳に必須です。
			//AR重畳表示定義データ名は利用者定義データを組み込み時に重畳を特定するためにチェックしています。
			if(arName != null && sceneId!=null && markerId != null && value != null){
				//AR重畳表示定義データに利用者定義データを組み込みます。
				value = Apl.insertUserData(value, arName);
				if(superimposedGraphic[sceneId] == null) superimposedGraphic[sceneId] = new Object();
				if(superimposedGraphic[sceneId][markerId] == null) superimposedGraphic[sceneId][markerId] = new Array(value);
				else superimposedGraphic[sceneId][markerId].push(value);
			}
		}
	return superimposedGraphic;
	}catch(e){
		Apl.log(e);
	}
};

/** 
 * ar_nameが指定した値の場合、AR重畳表示定義データに利用者定義データを組み込みます。 
 * AR定義データの一部を編集してARコンテンツの表示を変更します。
 * サンプルではAR定義データの文字列を変更しています。
 */
Apl.insertUserData = function(_superimposedGraphic, _arName){
	if(_arName == "業務サンプル_点検値" && Apl.userData !=null ){
		//組み込む文字列を作成します。
		var registrationDate = new Date(Apl.userData.time);
		var month = registrationDate.getMonth() + 1;
		var vDate = month + "/" + registrationDate.getDate();
		var commentStr = "【"+vDate+"  "+Apl.userData.name+"】温度は"+Apl.userData.temperature+"℃";
		
		//superimposedGraphic -> SquareModelGraphic -> TextTextureのTextを編集します。
		_superimposedGraphic.getGraphic().getTexture().setText(commentStr);
	}
	return _superimposedGraphic;
};

/** 指定したシーンID、マーカーIDのAR重畳表示定義データをネイティブの描画レイヤに設定します。 */
Apl.setARContents = function(_sceneId, _markerId){
	if(Apl.superimposedGraphics[_sceneId] != null){ // 指定したシーンIDのAR重畳表示定義データがある場合
		if(_markerId == null){ // マーカーIDの指定がない場合、シーン全てのAR重畳表示定義データを設定します。
			for(marker in Apl.superimposedGraphics[_sceneId]){
				//ARマーカーの座標系を作成してマーカーIDを指定
				var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
				coordinateSystem.setValue(parseInt(marker));
				try{
					//対象マーカーIDのARコンテンツを削除
					AR.Renderer.remove(coordinateSystem, Apl.noop, Apl.removeError);
					//ネイティブAR表示層にAR重畳表示定義データを設定します。
					AR.Renderer.put(coordinateSystem, Apl.superimposedGraphics[_sceneId][parseInt(marker)], Apl.noop, Apl.putError);
				} catch (e){
					Apl.log(e);
				}
			}
		} else if(Apl.superimposedGraphics[_sceneId][_markerId] != null) { //指定したマーカーIDのAR重畳表示定義データがある場合
			//ARマーカーの座標系を作成してマーカーIDを指定
			var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
			coordinateSystem.setValue(_markerId);
			try{
				//対象マーカーIDのARコンテンツを削除
				AR.Renderer.remove(coordinateSystem, Apl.noop, Apl.removeError);
				//ネイティブAR表示層にAR重畳表示定義データを設定します。
				AR.Renderer.put(coordinateSystem, Apl.superimposedGraphics[_sceneId][_markerId], Apl.noop, Apl.putError);
			} catch (e){
				Apl.log(e);
			}
		}
	}
};

/** 「作業開始」 ボタンが押されたときに呼ばれます。 */
Apl.start = function(){
	//ネイティブAR表示層に設定したAR重畳表示定義データを全てクリアします。
	try{
		AR.Renderer.clear(Apl.clearSuccess,Apl.clearError);
	} catch(e){
		Apl.log(e);
	}
};

/** AR重畳表示定義データのクリアに成功した場合 */
Apl.clearSuccess = function(_result){
	//work.htmlに遷移します。
	location.href="work.html";
};

/** 
 * work.htmlの画面初期化処理です。
 * Webストレージに保存したデータの取得、画面表示の変更、カメラの起動、マーカー検知イベントリスナを登録します。
 */
Apl.onloadWork = function(){
	//Webストレージに保存した全てのデータを取得します。
	Apl.getLocalStorageData();
	
	//動作モードに応じてhtml表示を変更します。
	Apl.showOperationMode();
	//シーンに合わせたhtml表示に変更します。
	Apl.changeSceneView();
	
	//画面タップのイベントリスナを登録します。
	if(window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) 
		document.addEventListener("touchstart", Apl.clickEvent, false);
	else document.addEventListener("click", Apl.clickEvent, false);
	
	//ネイティブカメラを起動させます。
	try{
		AR.Camera.startCameraView(Apl.noop, Apl.startCameraViewError);
	} catch (e){
		Apl.log(e);
	}
	//マーカー検知のイベントリスナ追加です。
	try{
		AR.Camera.addMarkerListener( Apl.addMarkerListenerSuccess, Apl.addMarkerListenerError, Apl.onDetectMarker, Apl.noop);
	}catch(e){
		Apl.log(e);
	}
};

/** シーンに合わせたhtml表示に変更します。 */
Apl.changeSceneView = function(){
	//画面下部のシーン操作ボタンの表示/非表示を切り替えます。
	if(Apl.sceneId > 1) document.getElementById("backScene").style.visibility = "visible";
	else document.getElementById("backScene").style.visibility = "hidden";
	if(Apl.sceneId < 4 ) document.getElementById("forwardScene").style.visibility = "visible";
	else document.getElementById("forwardScene").style.visibility = "hidden";
	
	//画面上部の表示変更
	var guidance = "手順"+Apl.sceneId+" : " + Apl.sceneList[Apl.sceneId].name + "<br>";
	if( Apl.sceneList[Apl.sceneId].description != null) guidance += Apl.sceneList[Apl.sceneId].description;
	document.getElementById("guidance").innerHTML = guidance;
};

/**
 * マーカー検知登録のonSuccessに設定するコールバック関数です。
 */
Apl.addMarkerListenerSuccess = function(_result){
	//リスナIDをApl.listenerIdに格納します。登録したマーカー検知イベントリスナの削除に使用します。
	Apl.listenerId = _result.getValue();
};

/**
 * マーカー検知用の成功メソッドです。
 * マーカーを検知した場合に呼び出されます。
 */
Apl.onDetectMarker = function(_result){
	// 引数に検知したマーカ情報が含まれています。
	var markval = _result.getValue();
	
	if(markval.markerId == 1){ //マーカー1を検知した場合
		if(markval.status == true){ //検出した場合
			//マーカー検知通知領域の表示を変更します。
			document.getElementById("detect").innerHTML ="マーカー" +markval.markerId+"を検出しました。";
			//動作モードを判定します。
			if(Apl.operationMode == "serverMode"){ //サーバ通信モードの場合
				//AR実行サーバから強制読み込みを行う
				//シーンが4の時は利用者定義データを取得
				if(Apl.sceneId == 4) Apl.getUserData(true);
				Apl.getSuperimposedGraphicData(true, new Apl.Range(Apl.scenarioId), new Apl.Range(Apl.sceneId), new Apl.Range(1));
			} else { //スタンドアローンモードの場合
				//オフラインストレージから取得します。
				if(Apl.sceneId == 4) Apl.getUserData(false);
				Apl.getSuperimposedGraphicData(false, new Apl.Range(Apl.scenarioId), new Apl.Range(Apl.sceneId), new Apl.Range(1));
			}
			
		} else if(markval.status == false){ //消失した場合
			//マーカー検知通知領域の表示を変更します。
			document.getElementById("detect").innerHTML ="";
		}
	}
};

/** シーンを切り替えます。 */
Apl.shiftScene = function(_shift){
	if(_shift == true) Apl.sceneId++; //シーンを進める。
	else Apl.sceneId--; //シーンを戻す。
	
	if(Apl.sceneId>4) Apl.sceneId = 4;
	if(Apl.sceneId<1) Apl.sceneId = 1;
	
	//シーンに合わせたhtml表示に変更します。
	Apl.changeSceneView();
	//現在のシーンIDをWebストレージに保存します。
	localStorage.setItem("sceneId", Apl.sceneId);
	
	//検出中のマーカーを取得します。
	try{
		AR.Camera.getCurrentMarkers(Apl.getMarkersSuccess, Apl.getCurrentMarkersError);
	} catch (e){
		Apl.log(e);
	}
};

/** マーカー取得に成功した場合に呼ばれます。 */
Apl.getMarkersSuccess = function(_result){
	//検出したマーカーから特定のマーカーを探します。
	for(var i=0;i<_result.getValue().length;i++){
		var markerId = _result.getValue()[i].value;
		if(markerId == 1){ // マーカーIDが1の場合
			
			if(Apl.operationMode == "serverMode"){ //サーバ通信モードの場合
				//AR実行サーバから強制読み込みを行います。
				//シーンが4の場合は利用者定義データを取得します。
				if(Apl.sceneId == 4) Apl.getUserData(true);
				Apl.getSuperimposedGraphicData(true, new Apl.Range(Apl.scenarioId), new Apl.Range(Apl.sceneId), new Apl.Range(1));
			} else { //スタンドアローンモードの場合
				//オフラインストレージから取得します。
				//シーンが4の場合は利用者定義データを取得します。
				if(Apl.sceneId == 4) Apl.getUserData(false);
				Apl.getSuperimposedGraphicData(false, new Apl.Range(Apl.scenarioId), new Apl.Range(Apl.sceneId), new Apl.Range(1));
			}
		}
	}
};

/** 「アップロード」ボタンが押された場合 */
Apl.onClickUpload = function(){
	if(Apl.postData != null){ //未登録データが存在する場合
		var result = confirm("アップロードしますか？");
		if(result){
			if(Apl.operationMode == "serverMode"){ // サーバ通信モードの場合
				Apl.upload();
			} else { // スタンドアローンモードの場合
				
				 if(location.href.indexOf("comment.html") > 0){
					alert("データを保存しました。サーバ通信モードでアップロードしてください。");
					location.href = "work.html";
				} else {
					alert("サーバ通信モードでアップロードしてください。");
				}
			}
		}
	} else {
		alert("保存されたデータはありません。")
	}
};

/** 保存したデータをアップロードします。 */
Apl.upload = function(){
	try{
		AR.Data.postArServerData(Apl.postData.query, Apl.postData.body, Apl.uploadSuccess, Apl.postArServerDataError);
	} catch (e){
		Apl.log(e);
	}
	
};

/** アップロードに成功した場合のコールバック関数です。 */
Apl.uploadSuccess = function(_result){
	//Webストレージに保存したデータを削除します。
	localStorage.removeItem("postData");
	Apl.postData = null;
	alert("アップロードしました。");
	//work.htmlに遷移します。
	if(location.href.indexOf("comment.html")>0)
		location.href = "work.html";
};

/** クリックイベントが発生したときに呼ばれます。 */
Apl.clickEvent = function(){
	//ネイティブアプリケーションにクリック座標を通知します。
	try{
		if(event)
			AR.OS.onBodyClick(event, Apl.noop, Apl.onBodyClickError);
	} catch(e){
		Apl.log(e);
	} 
};

/** 点検値入力をタップしたときに呼ばれます。 */
Apl.changeCommentpage = function(){
	//保存データがないか確認します。
	if(Apl.postData){
		var result = confirm("保存されたデータがあります。データを破棄して入力し直しますか？");
		if(result == false) return;
	} 
	//点検値入力追加ページへ遷移します。
	location.href="comment.html";
	
};

/**
 * work.htmlの画面終了処理です。
 * マーカー検知時のイベントリスナを削除します。
 */
Apl.onUnloadWork = function(){
	//イベントリスナを削除します。
	try{
		AR.Camera.removeMarkerListener(Apl.listenerId, Apl.removeListenerId, Apl.removeMarkerListenerError);
	} catch (e){
		Apl.log(e);
	}
	
};

/** マーカー検知時のイベントリスナ削除に成功した場合のコールバック関数です。 */
Apl.removeListenerId = function(_result){
	Apl.listenerId = "";
};

/** 
 * comment.htmlの画面初期化処理です。
 * Webストレージに保存したデータを取得、カメラを停止します。
 */
Apl.onloadComment = function(){
	//Webストレージに保存した全てのデータを取得します
	Apl.getLocalStorageData();
	//動作モードに応じてhtml表示を変更します。
	Apl.showOperationMode();
	try{
		//ネイティブカメラを停止します。
		AR.Camera.stopCameraView(Apl.noop, Apl.stopCameraViewError);
	} catch (e){
		Apl.log(e);
	}
};

/**
 * 点検値入力ページから作業画面へのページ遷移です。
 */
Apl.changeWorkpage = function(){
	location.href="work.html";
};

/**
 * 点検値入力の処理です。
 * 点検値入力画面で「OK」が押下された場合に呼び出されます。
 */
Apl.onClickOK = function(){
	//入力データを取得します。
	var data = Apl.getCommentData();
	if(data){
		
		Apl.userData = data;
		//AR実行サーバに登録するクエリデータを作成します。
		Apl.postData = new Object();
		Apl.postData.query = "quads";
		Apl.postData.body = Apl.createCommentDataQuad(data);
		
		//Webストレージに保存します。
		localStorage.setItem("userData", JSON.stringify(Apl.userData));
		localStorage.setItem("postData", JSON.stringify(Apl.postData));
		
		if(Apl.operationMode == "serverMode"){ // サーバ通信モードの場合
			Apl.upload();
		} else { //スタンドアローンモードの場合
			alert("データを保存しました。サーバ通信モードでアップロードしてください。");
			if(location.href != "work.html") location.href = "work.html";
		}
	}
};

/** 入力フォームからデータを取得します。 */
Apl.getCommentData = function(){

	var fName = document.comment_form.f_name.value;
	//名前が入力されていない場合はalert表示
	if(fName == null || fName == ""){
		alert("名前が入力されていません。入力してください。");
		return;
	}
	//名前が長い場合はalert表示
	if(fName.length>30){
		alert("名前が長すぎます。30文字以下にしてください。");
		return;
	}
	var fTemperature = document.comment_form.f_comment.value;
	//温度が入力されていない場合はalert表示
	if(fTemperature == null || fTemperature == ""){
		alert("温度が入力されていません。入力してください。");
		return;	
	}
	
	//温度が長い場合はalert表示　0~999
	if(fTemperature.length > 3){
		alert("温度は0～999の範囲で入力してください。");
		return;	
	}
	
	//利用者データオブジェクト作成
	var data = new Object();
	data.name = fName;
	data.temperature = parseInt(fTemperature,10);
	data.time = new Date().getTime();
	return data;

};

/** 登録用の利用者定義データを作成します。 */
Apl.createCommentDataQuad = function(_data){

	// QUADを作成します。
	var quad = new Apl.Quad();
	
	// QUADのタイプネームを設定します。
	quad.qtypeName = "usr_sample";
	
	// QUADの各属性の値を作成します。
	// QValue ar_idを作成します。
	var arId = new Apl.QValue();
	arId.qtypeName = "usr_sample";
	arId.qattributeName = "ar_id";
	arId.stringValue = null;
	arId.longValue = 1;
	arId.floatValue = null;
	
	// QValue ar_nameを作成します。
	var arName = new Apl.QValue();
	arName.qtypeName = "usr_sample";
	arName.qattributeName = "ar_name";
	arName.stringValue = "点検結果";
	arName.longValue = null;
	arName.floatValue = null;
	
	// QValue ar_descriptionを作成します。
	var arDescription = new Apl.QValue();
	arDescription.qtypeName = "usr_sample";
	arDescription.qattributeName = "ar_description";
	arDescription.stringValue = "AR業務サンプルアプリケーションの点検結果です。";
	arDescription.longValue = null;
	arDescription.floatValue = null;
	
	// QValue ar_registrationtimeを作成します。
	var arRegistrationtime = new Apl.QValue();
	arRegistrationtime.qtypeName = "usr_sample";
	arRegistrationtime.qattributeName = "ar_registrationtime";
	arRegistrationtime.stringValue = null;
	arRegistrationtime.longValue = _data.time;
	arRegistrationtime.floatValue = null;
	
	// QValue ar_modificationtimeを作成します。
	var arModificationtime = new Apl.QValue();
	arModificationtime.qtypeName = "usr_sample";
	arModificationtime.qattributeName = "ar_modificationtime";
	arModificationtime.stringValue = null;
	arModificationtime.longValue = _data.time;
	arModificationtime.floatValue = null;

	// QValue usr_nameを作成します。
	var usrName = new Apl.QValue();
	usrName.qtypeName = "usr_sample";
	usrName.qattributeName = "usr_name";
	usrName.stringValue = _data.name;
	usrName.longValue = null;
	usrName.floatValue = null;
	
	// QValue usr_temperatureを作成します。
	var usrTemperature = new Apl.QValue();
	usrTemperature.qtypeName = "usr_sample";
	usrTemperature.qattributeName = "usr_temperature";
	usrTemperature.stringValue = null;
	usrTemperature.longValue = _data.temperature;
	usrTemperature.floatValue = null;
	
	// QValueをQUADに設定します。
	quad.qvalues = [arId,arName,arDescription,arRegistrationtime,arModificationtime,usrName,usrTemperature]
	
	//文字列に変換します。
	var rtndata = JSON.stringify(quad);
	return rtndata;
};

