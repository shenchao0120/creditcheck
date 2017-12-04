package main

import (
	"testing"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"fmt"
)

func checkInit (t *testing.T,stub *shim.MockStub,args [][]byte){
	res:=stub.MockInit("1",args)
	if res.Status!=shim.OK {
		fmt.Println("init failed", string(res.Message))
		t.FailNow()
	}
}

func checkInvoke (t *testing.T,stub *shim.MockStub,args [][]byte){
	res:=stub.MockInvoke("1",args)
	if res.Status!=shim.OK {
		fmt.Println("Invoke",args,"failed", string(res.Message))
		t.FailNow()
	}
	fmt.Println("the result is "+res.Message+","+string(res.Payload))
}


func TestExample01_init(t *testing.T){
	cicc:=new(CusInfoChaincode)
	stub:=shim.NewMockStub("ex01",cicc)
	checkInit(t,stub,[][]byte{[]byte("init")})
}

func TestExample01_InvokeRequest(t *testing.T){
	cicc:=new(CusInfoChaincode)

	stub:=shim.NewMockStub("ex01",cicc)
	checkInit(t,stub,[][]byte{[]byte("init")})
	checkInvoke(t,stub,[][]byte{[]byte("cusInfoRequest"),[]byte("CUSID01"),[]byte("ORGID01"),[]byte("1"),[]byte("OrgID01,OrgID02,OrgID03,OrgID04"),[]byte("0")})
	checkInvoke(t,stub,[][]byte{[]byte("cusInfoRequest"),[]byte("CUSID02"),[]byte("ORGID02"),[]byte("1"),[]byte("OrgID01,OrgID02,OrgID03,OrgID04"),[]byte("0")})


	checkInvoke(t,stub,[][]byte{[]byte("queryAllRequest")})

}

func TestExample01_QueryRequest(t *testing.T){
	cicc:=new(CusInfoChaincode)
	stub:=shim.NewMockStub("ex01",cicc)
	checkInvoke(t,stub,[][]byte{[]byte("queryAllRequest")})
}

func TestExample01_InvokeRespond(t *testing.T){
	cicc:=new(CusInfoChaincode)
	stub:=shim.NewMockStub("ex01",cicc)
	checkInvoke(t,stub,[][]byte{[]byte("cusInfoRespond"),[]byte("TXIDaa"), []byte("OrgID01"),[]byte("true"),[]byte("2017-11-18"),[]byte("RespondInfo1...")})
	checkInvoke(t,stub,[][]byte{[]byte("cusInfoRespond"),[]byte("TXIDaa"), []byte("OrgID02"),[]byte("true"),[]byte("2017-11-18"),[]byte("RespondInfo2...")})
	checkInvoke(t,stub,[][]byte{[]byte("queryAllRespond"),[]byte("TXIDaa")})
}

func TestExample01_InvokePubInfo(t *testing.T){
	cicc:=new(CusInfoChaincode)
	stub:=shim.NewMockStub("ex01",cicc)
	checkInvoke(t,stub,[][]byte{[]byte("publicCusInfo"),[]byte("CUSID01"), []byte("OrgID01"),[]byte("2017-11-18"),[]byte("Public cus Info1...")})
	checkInvoke(t,stub,[][]byte{[]byte("publicCusInfo"),[]byte("CUSID02"), []byte("OrgID01"),[]byte("2017-11-18"),[]byte("Public cus Info2...")})
	checkInvoke(t,stub,[][]byte{[]byte("queryAllPublic")})
}

