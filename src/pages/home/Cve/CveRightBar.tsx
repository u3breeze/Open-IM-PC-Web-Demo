import {
  Avatar,
  Button,
  Drawer,
  Input,
  Layout,
  message,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import right_file from "@/assets/images/right_file.png";
import right_file_se from "@/assets/images/right_file_se.png";
import right_search from "@/assets/images/right_search.png";
import right_search_se from "@/assets/images/right_search_se.png";
import right_setting from "@/assets/images/right_setting.png";
import right_setting_se from "@/assets/images/right_setting_se.png";
import right_notice from "@/assets/images/right_notice.png";
import right_notice_se from "@/assets/images/right_notice_se.png";
import { FC, useEffect, useState } from "react";
import { Cve, FriendItem, GroupMember } from "../../../@types/open_im";
import {
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MyAvatar } from "../../../components/MyAvatar";
import { events, im, isSingleCve } from "../../../utils";
import UserCard from "../components/UserCard";
import { RESETCVE, TOASSIGNCVE, UPDATEPIN } from "../../../constants/events";

const { Sider } = Layout;
const { Paragraph } = Typography;

type CveRightBarProps = {
  curCve: Cve;
  groupMembers?: GroupMember[];
  friendInfo?: FriendItem;
};

const CveRightBar: FC<CveRightBarProps> = ({
  curCve,
  groupMembers,
  friendInfo
}) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [draggableCardVisible, setDraggableCardVisible] = useState(false);
  const [curTool, setCurTool] = useState(-1);

  useEffect(()=>{
    events.on(TOASSIGNCVE,()=>{
      setCurTool(-1)
      setDraggableCardVisible(false)
      setVisibleDrawer(false)
    })
    return ()=> {
      events.off(TOASSIGNCVE,()=>{})
    }
  },[])

  const onClose = () => {
    setVisibleDrawer(false);
    setCurTool(-1);
  };

  const closeDragCard = () => {
    setDraggableCardVisible(false);
  };

  const delFriend = () => {
    im.deleteFromFriendList(curCve.userID).then(res=>{
      events.emit(RESETCVE)
      message.success("???????????????????????????")
    }).catch(err=>message.success("???????????????????????????"))
  }

  const clickItem = (idx: number) => {
    setCurTool(idx);
    switch (idx) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        setVisibleDrawer(true);
        break;
      default:
        break;
    }
  };

  const toolIcon = (tool: typeof tools[0]) => {
    if (tool.tip === "?????????") return null;
    return (
      <Tooltip key={tool.tip} placement="right" title={tool.tip}>
        <div
          className="right_bar_col_icon"
          onClick={() => tool.method(tool.idx)}
        >
          <img
            width="20"
            height="20"
            src={curTool === tool.idx ? tool.icon_se : tool.icon}
          />
        </div>
      </Tooltip>
    );
  };

  const tools = [
    {
      tip: "?????????",
      icon: right_notice,
      icon_se: right_notice_se,
      method: clickItem,
      idx: 0,
    },
    {
      tip: "??????",
      icon: right_search,
      icon_se: right_search_se,
      method: clickItem,
      idx: 1,
    },
    {
      tip: "??????",
      icon: right_file,
      icon_se: right_file_se,
      method: clickItem,
      idx: 2,
    },
    {
      tip: "??????",
      icon: right_setting,
      icon_se: right_setting_se,
      method: clickItem,
      idx: 3,
    },
  ];

  const updatePin = () => {
    const options = {
      conversationID:curCve.conversationID,
      isPinned:curCve.isPinned===0?true:false
    }
    im.pinConversation(options).then(res=>{
      message.success(curCve.isPinned===0?"????????????!":"??????????????????!")
      events.emit(UPDATEPIN,curCve.isPinned===0?1:0)
    }).catch(err=>{})
  }

  const quitGroup = () => {
    im.quitGroup(curCve.groupID).then(res=>{
      events.emit(RESETCVE)
      message.success("?????????????????????")
    }).catch(err=>message.error("?????????????????????"))
  }

  const inviteToGroup = () => {

  }

  const delInGroup = () => {

  }

  const SingleDrawer = () => (
    <div className="single_drawer">
      <div
        onClick={() => setDraggableCardVisible(true)}
        className="single_drawer_item"
      >
        <div className="single_drawer_item_left">
          <Avatar size={36} shape="square" src={curCve.faceUrl} />
          <div style={{ fontWeight: 500 }} className="single_drawer_item_title">
            {curCve.showName}
          </div>
        </div>
        <RightOutlined />
      </div>
      <div className="single_drawer_item">
        <div className="single_drawer_item_left">
          <TeamOutlined />
          <div className="single_drawer_item_title">????????????</div>
        </div>
        <RightOutlined />
      </div>
      <div className="single_drawer_item">
        <div>???????????????</div>
        <Switch checked={curCve.isPinned===0?false:true} size="small" onChange={updatePin} />
      </div>
      <div className="single_drawer_item">
        <div>??????????????????</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <div className="single_drawer_item">
        <div>???????????????</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <Button onClick={delFriend} danger className="single_drawer_btn">
        ????????????
      </Button>
    </div>
  );

  const GroupDrawer = () => (
    <div className="group_drawer">
      <div className="group_drawer_item">
        <div className="group_drawer_item_left">
          <Avatar size={36} shape="square" src={curCve.faceUrl} />
          <div className="group_drawer_item_info">
            <div className="group_drawer_item_title">{curCve.showName}</div>
            <div className="group_drawer_item_sub">???????????????</div>
          </div>
        </div>
        <RightOutlined />
      </div>
      <div className="group_drawer_row">
        <div className="group_drawer_row_title">
          <div>?????????</div>
          <RightOutlined />
        </div>
        <div className="group_drawer_row_input">
          <Input placeholder="??????" prefix={<SearchOutlined />} />
        </div>
        <div className="group_drawer_row_icon">
          {groupMembers!.length > 0
            ? groupMembers!.map((gm, idx) => {
                if (idx < 7) {
                  return (
                    <MyAvatar
                      key={gm.userId}
                      shape="square"
                      size={32.8}
                      src={gm.faceUrl}
                      icon={<UserOutlined />}
                    />
                  );
                }
              })
            : null}
          <PlusOutlined onClick={inviteToGroup} />
          <MinusOutlined onClick={delInGroup} />
        </div>
      </div>
      <div className="group_drawer_item">
        <div>?????????</div>
        <RightOutlined />
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>?????????</div>
        <Paragraph
          editable={{
            tooltip: "????????????",
            maxLength: 15,
            onChange: () => {},
          }}
        >
          {"nickName"}
        </Paragraph>
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>??????ID</div>
        <div className="group_id">{curCve.groupID}</div>
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>???????????????</div>
        <Switch checked={curCve.isPinned===0?false:true} size="small" onChange={updatePin} />
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>???????????????</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <div className="group_drawer_btns">
        <Button onClick={quitGroup} danger className="group_drawer_btns_item">
          ????????????
        </Button>
        <Button type="primary" danger className="group_drawer_btns_item">
          ????????????
        </Button>
      </div>
    </div>
  );

  return (
    <Sider width="42" theme="light" className="right_bar">
      <div className="right_bar_col">{tools.map((t) => toolIcon(t))}</div>
      <Drawer
        className="right_set_drawer"
        width={360}
        // mask={false}
        maskClosable
        title="??????"
        placement="right"
        onClose={onClose}
        visible={visibleDrawer}
        getContainer={document.getElementById("chat_main")!}
      >
        {isSingleCve(curCve) ? <SingleDrawer /> : <GroupDrawer />}
      </Drawer>
      {friendInfo && (
        <UserCard
          close={closeDragCard}
          info={friendInfo}
          draggableCardVisible={draggableCardVisible}
        />
      )}
    </Sider>
  );
};

export default CveRightBar;
