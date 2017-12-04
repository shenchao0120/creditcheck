package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	pb "github.com/hyperledger/fabric/protos/peer"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"strings"
)
const CusRequestIndex = `cusRequest`
const CusRespondIndex = `cusRespond`
const CusPublicIndex = `cusPublic`
type CusInfoChaincode struct{
}

type CusInfoRequest struct {
	Txid string `json:"txid"`
	CusID  string `json:"id"`
	OrgID string `json:"orgId"`
	ReqType int `json:"reqType"`
	ReqOrgID []string `json:"reqBankId"`
	TimeLine int `json:"timeLine"`
	PubKey []byte `json:"pubKey"`
}

type CusInfoPublic struct {
	CusID  string `json:"id"`
	OrgID string `json:"orgId"`
	PubCusInfo CusInfo `json:"pubCusInfo"`
}

type CusInfoRespond struct {
	TxID string `json:"txId"`
	OrgID string `json:"orgId"`
	IsCrypto bool `json:"isCrypto"`
	Date string `json:date`
	RespondInfo []byte `json:"respondInfo"`
}
type CusInfoPub struct {
	CusId string `json:"cusId"`
	OrgID string `json:"orgId"`
	Date string `json:date`
	CusInfo []byte `json:"cusInfo"`
}

type CusInfo struct {
	CusID string `json:"cusId"`
	Name string `json:"name"`
	PhoneNum string `json:"phoneNum"`
	BaseInfo CusBaseInfo `json:"baseInfo"`
	CreditInfos []CusCreditInfo `json:"creditInfos"`
	DepositInfos []CusDepositInfo `json:"depositInfos"`
}

type CusBaseInfo struct {
	Gender int `json:"gender"`
	Birthday string  `json:"birthday"`
	PhoneNum string `json:"phoneNum"`
	Marriage bool `json:"marriage"`
	Address string `json:"address"`
	Email string `json:"email"`
	Company string `json:"company"`
}

type CusCreditInfo struct {
	BusType string `json:"busType"`
	BusNo string `json:"busNo"`
	BeginDay string `json:"beginDay"`
	Ccy 	string  `json:"ccy"`
	PayUnit string `json:"payUnit"`
	PayNum int `json:"int"`
	DebtAmt float64 `json:"debtAmt"`
	SetlAmt float64 `json:"setlAmt"`
	OwnInt  float64 `json:"ownInt"`
	SetlInt float64 `json:"setlInt"`
	RemainPayNum int `json:"remainPayNum"`
	NxtPayDay string `json:"nxtPayDay"`
	LastPayDay string `json:"lastPayDay"`
	MonthPayAmt float64 `json:"monthPayAmt"`
	OdDays int `json:"odDays"`
	OwnODInt float64 `json:"ownOdInt"`
	SetlODInt float64 `json:"setlOdInt"`
	Classes int `json:"classes"`
}

type CusDepositInfo struct {
	AccNo string `json:"accNo"`
	AccType string `json:"accType"`
	AccStatus string `json:"accStatus"`
	OpenTime string `json:"openTime"`
	OpenBank string `json:"openBank"`
	Balance float64 `json:"balance"`
	maxBalance float64 `json:"maxBalance"`
	minBalance float64 `json:"minBalance"`
}

func (t *CusInfoChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("chaincode init...")
	return shim.Success(nil)
}

func (t *CusInfoChaincode) Invoke (stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)
	if function=="initSetting" {
		return t.initSetting(stub,args)
	}
	if  function=="cusInfoRequest" {
		return t.cusInfoRequest(stub,args)
	}
	if function == "queryAllRequest" {
		return t.queryAllRequest(stub)
	}
	if function == "cusInfoRespond" {
		return t.cusInfoRespond(stub,args)
	}
	if function == "queryAllRespond" {
		return t.queryAllRespond(stub,args)
	}
	if function == "publicCusInfo" {
		return t.publicCusInfo(stub,args)
	}
	if function == "queryAllPublic" {
		return t.queryAllPublic(stub)
	}
	return shim.Error("Incorrect invoke function")
}

func (t *CusInfoChaincode)initSetting(stub shim.ChaincodeStubInterface,args []string) pb.Response{
	fmt.Println("chaincode init...")
	return shim.Success(nil)
}

func (t *CusInfoChaincode)cusInfoRequest(stub shim.ChaincodeStubInterface,args []string) pb.Response {
	fmt.Println("invoke cusInfoRequest.")
	if (len(args) < 5) {
		return shim.Error("Incorrect number of arguments. Expecting >=5")
	}
	//request type
	reqType, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("3rd argument must be a numeric string")
	}
	reqOrgIDs := strings.Split(args[3], ",")
	for i, org := range reqOrgIDs {
		reqOrgIDs[i] = strings.ToUpper(org)
	}
	timeLine, err := strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("5rd argument must be a numeric string")
	}
	var pubkey []byte
	if (len(args) >= 6) {
		pubkey = []byte(args[6])
	}
	//if (len)
	//request organization
	cusInfo := CusInfoRequest{
		Txid: stub.GetTxID(),
		CusID:    args[0],
		OrgID:    args[1],
		ReqType:  reqType,
		ReqOrgID: reqOrgIDs,
		TimeLine: timeLine,
		PubKey:   pubkey,
	}
	cusInfoJSONBytes, err := json.Marshal(cusInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save marble to state ===
	compositeKey,err:=cusInfo.makeCompositeKey(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(compositeKey, cusInfoJSONBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	if err := cusInfo.EmitRequest(stub); err != nil {
		return pb.Response{Status: 500, Message: "Event emission failure."}
	}
	fmt.Println("compositeKey:",compositeKey,"value:",cusInfoJSONBytes)

	return shim.Success(nil)
}

func (this *CusInfoRequest) makeCompositeKey(stub shim.ChaincodeStubInterface) (string, error) {
	keyParts := []string{
		this.OrgID,
		this.CusID,
	}
	return stub.CreateCompositeKey(CusRequestIndex, keyParts)
}

func (this *CusInfoRequest) EmitRequest(stub shim.ChaincodeStubInterface) error {
	data, err := this.toJSON()
	if err != nil {
		return err
	}
	if err = stub.SetEvent(CusRequestIndex, data); err != nil {
		return err
	}
	return nil
}

func (this *CusInfoRequest) toJSON() ([]byte, error) {
	return json.Marshal(this)
}

func (t CusInfoChaincode)queryAllRequest (stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Invoke queryAllRequest")
	it, err := stub.GetStateByPartialCompositeKey(CusRequestIndex, []string{})
	if err!=nil {
		return shim.Error(err.Error())
	}
	defer it.Close()
	infoRequests:=[]CusInfoRequest{}
	for it.HasNext() {
		response, err := it.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		infoRequest := CusInfoRequest{}
		if err:=infoRequest.FillFromLedgerValue(response.Value);err!=nil {
			return shim.Error(err.Error())
		}
		infoRequests = append(infoRequests, infoRequest)

	}
	result,err:=json.Marshal(infoRequests)
	if err!=nil {
		return shim.Error(err.Error())
	}
	return shim.Success(result)
}

func (t *CusInfoChaincode)cusInfoRespond(stub shim.ChaincodeStubInterface,args []string) pb.Response {
	fmt.Println("invoke cusInfoRespond.")
	if (len(args) < 5) {
		return shim.Error("Incorrect number of arguments.Expecting 5")
	}
	isCrypto, err := strconv.ParseBool(args[2])
	if err!=nil{
		fmt.Println(err.Error())
		return shim.Error("The 3rd argument must be bool")
	}
	respondInfo:=CusInfoRespond{
		TxID:args[0],
		OrgID:args[1],
		IsCrypto:isCrypto,
		Date:args[3],
		RespondInfo:[]byte(args[4]),
	}

	key,err:=stub.CreateCompositeKey(CusRespondIndex,[]string{args[0],args[1]})

	if err!=nil{
		fmt.Println(err.Error())
		return shim.Error(err.Error())
	}
	cusRespondJSONBytes,err:=json.Marshal(respondInfo)
	if err!=nil{
		fmt.Println(err.Error())

		return shim.Error(err.Error())
	}
	err = stub.PutState(key, cusRespondJSONBytes)
	if err != nil {
		fmt.Println(err.Error())

		return shim.Error(err.Error())
	}
	fmt.Println("Respond success.")

	return shim.Success(nil)
}

func (this *CusInfoRequest) FillFromLedgerValue(bytes []byte) error {
	if err := json.Unmarshal(bytes, this); err != nil {
		return err
	} else {
		return nil
	}
}

func (t *CusInfoChaincode)queryAllRespond (stub shim.ChaincodeStubInterface,args []string) pb.Response {
	if len(args)!=1 {
		return pb.Response{Status: 400, Message: "Incorrect number of arguments."}
	}
	fmt.Println("invoke queryAllRespond function ...")
	txid:=args[0]
	it, err := stub.GetStateByPartialCompositeKey(CusRespondIndex, []string{txid})
	if err!=nil {
		shim.Error(err.Error())
	}
	cusinfos:= []CusInfoRespond{}

	defer it.Close()
	for it.HasNext() {
		response,err:=it.Next()
		if (err!=nil){
			shim.Error(err.Error())
		}
		cusinfo:=CusInfoRespond{}
		err=json.Unmarshal(response.Value,&cusinfo)
		if err!=nil {
			shim.Error(err.Error())
		}
		cusinfos=append(cusinfos,cusinfo)
	}
	result,err:=json.Marshal(cusinfos)
	if err!=nil {
		return shim.Error(err.Error())
	}
	return shim.Success(result)
}

func (t *CusInfoChaincode)publicCusInfo (stub shim.ChaincodeStubInterface ,args []string) pb.Response {
	if len(args)!=4 {
		return pb.Response{Status: 400, Message: "Incorrect number of arguments."}
	}
	cusID:=args[0]
	myOrgID:=args[1]
	date:=args[2]

	key,err:=stub.CreateCompositeKey(CusPublicIndex,[]string{cusID,myOrgID,date})
	if err!=nil {
		shim.Error(err.Error())
	}
	err=stub.PutState(key,[]byte(args[3]))
	if err!=nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

func (t *CusInfoChaincode)queryAllPublic(stub shim.ChaincodeStubInterface)pb.Response{
	it,err:=stub.GetStateByPartialCompositeKey(CusPublicIndex,[]string{})
	if err!=nil {
		shim.Error(err.Error())
	}
	pubInfos:=[]CusInfoPub{}
	for it.HasNext() {
		respond,err:=it.Next()
		if err!=nil {
			return shim.Error(err.Error())
		}
		_,compositeParts,err:=stub.SplitCompositeKey(respond.Key)
		pubInfo:=CusInfoPub{
			CusId:compositeParts[0],
			OrgID:compositeParts[1],
			Date:compositeParts[2],
			CusInfo:respond.Value,
		}
		pubInfos=append(pubInfos,pubInfo)
	}
	infoBytes,err:=json.Marshal(pubInfos)
	if err!=nil {
		shim.Error(err.Error())
	}
	return shim.Success(infoBytes)
}

func main(){
	err:=shim.Start(new(CusInfoChaincode))
	if err!=nil {
		fmt.Printf("Error starting credit check chaincode:%s",err)
	}
}

