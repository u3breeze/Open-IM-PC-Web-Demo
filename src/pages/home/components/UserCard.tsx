import { LeftOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Descriptions,
  Button,
  Input,
  Modal,
  Typography,
  Form,
  message,
  Tooltip,
  Upload,
} from "antd";
import { FC, useState, useRef, LegacyRef, useEffect } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { FriendItem, SelfInfo } from "../../../@types/open_im";
import { RootState } from "../../../store";
import { cosUpload, events, im } from "../../../utils";
import self_card from "@/assets/images/self_card.png";
import del_card from "@/assets/images/del_card.png";
import { MyAvatar } from "../../../components/MyAvatar";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { getSelfInfo } from "../../../store/actions/user";
import { getFriendList } from "../../../store/actions/contacts";
import { TOASSIGNCVE, UPDATEFRIENDCARD } from "../../../constants/events";
import { sessionType } from "../../../constants/messageContentType";

const { Paragraph } = Typography;

type UserCardProps = {
  draggableCardVisible: boolean;
  info: SelfInfo | FriendItem;
  close: () => void;
  type?: "self";
};

const UserCard: FC<UserCardProps> = ({
  draggableCardVisible,
  info,
  close,
  type,
}) => {
  const [draggDisable, setDraggDisable] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [drft, setDrft] = useState("");
  const [step, setStep] = useState<"info" | "send">("info");
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draRef = useRef<any>(null);
  const selectValue = (state: RootState) => state.contacts.friendList;
  const friendList = useSelector(selectValue, shallowEqual);
  const selfID = useSelector(
    (state: RootState) => state.user.selfInfo.uid,
    shallowEqual
  );
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  let selfInfo: SelfInfo = {};

  useEffect(() => {
    if (!type) {
      const idx = friendList.findIndex((f) => f.uid == info.uid);
      console.log(idx);

      if (idx > -1) {
        setIsFriend(true);
        setStep("info")
      } else {
        setIsFriend(false);
        setDrft("");
      }
    }
  }, [friendList,draggableCardVisible]);

  const onStart = (event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = draRef!.current!.getBoundingClientRect();
    setBounds({
      left: -targetRect?.left + uiData?.x,
      right: clientWidth - (targetRect?.right - uiData?.x),
      top: -targetRect?.top + uiData?.y,
      bottom: clientHeight - (targetRect?.bottom - uiData?.y),
    });
  };

  const sendApplication = ({ reqMessage }: { reqMessage: string }) => {
    const param = {
      uid: info.uid!,
      reqMessage,
    };
    im.addFriend(param)
      .then((res) => {
        console.log(res);
        message.success("???????????????????????????");
        close();
      })
      .catch((err) => {
        message.error("???????????????????????????");
      });
  };

  const clickBtn = () => {
    
    if (isFriend) {
      //TODO to cve
      events.emit(TOASSIGNCVE,info.uid,sessionType.SINGLECVE)
    } else {
      setStep("send");
    }
  };

  const updateSelfInfo = () => {
    im.setSelfInfo(selfInfo)
      .then((res) => {
        dispatch(getSelfInfo(selfID!));
        message.success("???????????????");
      })
      .catch((err) => message.error("???????????????"));
  };

  const updateComment = () => {
    im.setFriendInfo({ uid: info.uid!, comment: drft })
      .then((res) => {
        dispatch(getFriendList());
        events.emit(UPDATEFRIENDCARD)
        message.success("???????????????");
      })
      .catch((err) => message.error("???????????????"));
  };

  const uploadIcon = async (uploadData: UploadRequestOption) => {
      cosUpload(uploadData).then(res=>{
        selfInfo = {};
          selfInfo.icon = res.url;
          updateSelfInfo();
      }).catch(err=>message.error("?????????????????????"))
  };

  const goBack = () => {
    setStep("info");
    form.resetFields();
  };

  const myClose = () => {
    close();
    setDrft("");
    setStep("info");
    form.resetFields();
  };

  const genderEnd = () => {
    console.log(drft);
    
    if (drft === "???") {
      selfInfo.gender = 1;
      updateSelfInfo()
    } else if (drft === "???") {
      selfInfo.gender = 2;
      updateSelfInfo()
    } else {
      message.warning("????????????????????????");
    }
  };

  const infoEditConfig = {
    onEnd: updateComment,
    onChange: (s: string) => setDrft(s),
    onCancel: () => setDrft(""),
    autoSize: { maxRows: 2 },
    maxLength: 15,
  };

  const InfoTitle = () => (
    <>
      <div className="left_info">
        <div  className="left_info_title">{info.name}</div>
        <div className="left_info_icon">
          <img width={18} src={self_card} alt="" />
          {!type && (
            <img style={{ marginLeft: "8px" }} width={18} src={del_card} />
          )}
        </div>
      </div>
      <Upload
        openFileDialogOnClick={type?true:false}
        action={""}
        customRequest={(data) => uploadIcon(data)}
        showUploadList={false}
      >
        <MyAvatar
          shape="square"
          src={info.icon}
          size={42}
          icon={<UserOutlined />}
        />
      </Upload>
    </>
  );

  const SendTitle = () => (
    <>
      <div className="send_msg_title">
        <LeftOutlined
          className="cancel_drag"
          onClick={goBack}
          style={{ fontSize: "12px", marginRight: "12px" }}
        />
        <div className="send_msg_title_text">????????????</div>
      </div>
    </>
  );

  const SelfBody = () => (
    <>
      <Descriptions column={1} title="????????????">
        <Descriptions.Item label="??????">
          <Paragraph
            editable={{
              maxLength: 15,
              onChange: (v) => {
                setDrft(v);
              },
              onEnd: () => {
                selfInfo = {};
                selfInfo.name = drft;
              },
              // onCancel: editCancel,
            }}
          >
            {info.name}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="??????">
          <Paragraph
            editable={{
              maxLength: 1,
              onChange: (v) => {
                setDrft(v);
              },
              onEnd: genderEnd,
              // onCancel: editCancel,
            }}
          >
            {info.gender === 1 ? "???" : "???"}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="ID">{info.uid}</Descriptions.Item>
        <Descriptions.Item label="?????????">{info.mobile}</Descriptions.Item>
      </Descriptions>
    </>
  );

  const InfoBody = () => (
    <>
      <Descriptions column={1} title="????????????">
        <Descriptions.Item label="??????">{info.name}</Descriptions.Item>
        <Descriptions.Item label="??????">
          <Paragraph editable={isFriend ? infoEditConfig : false}>
            {(info as FriendItem).comment}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="ID">{info.uid}</Descriptions.Item>
        {/* <Descriptions.Item label="?????????">{info.mobile}</Descriptions.Item> */}
      </Descriptions>
      <Button onClick={clickBtn} className="add_con_btn" type="primary">
        {isFriend ? "????????????" : "????????????"}
      </Button>
    </>
  );

  const SendBody = () => (
    <>
      <div className="send_card_info">
        <div className="send_card_info_row1">
          <div>{info.name}</div>
          <MyAvatar
            shape="square"
            src={info.icon}
            size={42}
            icon={<UserOutlined />}
          />
        </div>
        <Form
          form={form}
          name="basic"
          onFinish={sendApplication}
          autoComplete="off"
        >
          <Form.Item name="reqMessage">
            <Input placeholder="?????????????????????" />
          </Form.Item>
        </Form>
      </div>
      <Button
        onClick={() => form.submit()}
        className="add_con_btn"
        type="primary"
      >
        ??????
      </Button>
    </>
  );

  const switchBody = () => {
    if (type) return <SelfBody />;
    switch (step) {
      case "info":
        return <InfoBody />;
      case "send":
        return <SendBody />;
      default:
        return null;
    }
  };

  return (
    <Modal
      // key="UserCard"
      className={step !== "send" ? "draggable_card" : "draggable_card_next"}
      closable={false}
      footer={null}
      mask={false}
      width={280}
      destroyOnClose={true}
      centered
      onCancel={myClose}
      title={
        <div
          className="draggable_card_title"
          onMouseOver={() => {
            if (draggDisable) {
              setDraggDisable(false);
            }
          }}
          onMouseOut={() => {
            setDraggDisable(true);
          }}
        >
          {step === "info" ? <InfoTitle /> : <SendTitle />}
        </div>
      }
      visible={draggableCardVisible}
      modalRender={(modal) => (
        <Draggable
          allowAnyClick={true}
          disabled={draggDisable}
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
          cancel={`.cancel_drag, .cancel_input, .ant-upload,.left_info_icon,.ant-modal-body`}
          enableUserSelectHack={false}
        >
          <div ref={draRef}>{modal}</div>
        </Draggable>
      )}
    >
      {switchBody()}
    </Modal>
  );
};

export default UserCard;
