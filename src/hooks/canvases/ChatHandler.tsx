import React, { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, StateInterface } from "../../redux";
import { ChatReducer } from "../../redux/reducers/chat.reducer";
import { yurex_game } from "../../utils/game/core";
import { BinaryWriter } from "../../utils/other/binary_packet";

import dropdownImage from "../../layout/img/slide_down.svg";
import rightDownImage from "../../layout/img/dropdown.svg";
import dropUp from "../../layout/img/dropup.svg";
import { GameReducer, TagPlayerType } from "../../redux/reducers/game.reducer";

export const ChatHandler: FC<{ enabled: boolean }> = ({ enabled }) => {
  if (!enabled) {
    return null;
  }

  const chatRef = React.useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<Dispatch<ChatReducer>>();
  const {
    messages,
    chat_input,
    isTyping,
    current_message,
    hidden_chat,
    chat_types_menu,
    isTeamType,
  } = useSelector<StateInterface, ChatReducer>((state) => state.chatReducer);

  const { profile } = useSelector<StateInterface, GameReducer>(
    (state) => state.gameReducer,
  );
  useEffect(() => {
    const firstMessage = messages[0x0];
    if (firstMessage) {
      let minutes_passed =
        Math.abs(Date.now() - firstMessage.timestamp) / 60000;
      if (minutes_passed >= 0x2) {
        let _messages = messages.slice(0x1);
        dispatch({
          type: "UPDATE_CHAT_STATE",
          payload: { messages: _messages },
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (chat_input) {
      setTyping(true);
      chatRef.current && chatRef.current.focus();
    } else if (isTyping) {
      let message = current_message;
      if (message.length > 0x0) {
        let bnf_chat = new BinaryWriter();
        bnf_chat.setUint8(0x63);
        bnf_chat.setUint8(0);
        bnf_chat.setStringUTF8(message);
        yurex_game.wshandler.sendpacket(bnf_chat);
      }
      setTyping(false);
    }
  }, [chat_input]);

  const updateMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    let message = event.target.value;
    if (message.length > 0x0) {
      dispatch({
        type: "UPDATE_CHAT_STATE",
        payload: {
          current_message: event.target.value,
        },
      });
    }
  };

  const setTyping = (typing: boolean) => {
    if (typeof typing !== "boolean") {
      return;
    }

    dispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        isTyping: typing,
      },
    });
  };

  const setChatType = (type: number) => {
    dispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        isTeamType: type === 0x1,
        chat_types_menu: false,
      },
    });
  };

  const checkTypeMessage = (tag: TagPlayerType): boolean => {
    let pass = true;

    if (isTeamType && !yurex_game.checkMyTag(tag)) {
      pass = false;
    }

    return pass;
  };

  const tag_button_enabled = !!(profile?.tag && profile?.tag?.code);

  return (
    <div id="chat-container">
      {chat_input ? (
        <div className="form-input">
          <input
            ref={chatRef}
            type="text"
            placeholder="Enter your message"
            onChange={updateMessage}
          />
        </div>
      ) : null}
      <div className="chat-box">
        <div className="control-section">
          {chat_types_menu ? (
            <div
              className={
                "chat-types-menu" +
                (hidden_chat || messages.length === 0x0 ? " go-up" : "")
              }
            >
              <div
                className={"button-menu" + (!isTeamType ? " active" : "")}
                onClick={() => setChatType(0x0)}
              >
                GLOBAL
              </div>
              <div
                className={
                  "button-menu" +
                  (isTeamType
                    ? " active"
                    : !tag_button_enabled
                    ? " disabled"
                    : "")
                }
                onClick={() => tag_button_enabled && setChatType(0x1)}
              >
                TEAM
              </div>
            </div>
          ) : null}
          <div
            className="drop-down button"
            onClick={() =>
              dispatch({
                type: "UPDATE_CHAT_STATE",
                payload: {
                  chat_types_menu: true,
                },
              })
            }
          >
            <div className="label">{isTeamType ? "TAG TEAM" : "ALL"}</div>
            <div className="icon">
              <img src={dropdownImage} />
            </div>
          </div>
          <div
            className="hide-button button"
            onClick={() =>
              dispatch({
                type: "UPDATE_CHAT_STATE",
                payload: {
                  hidden_chat: !hidden_chat,
                },
              })
            }
          >
            <img src={!hidden_chat ? rightDownImage : dropUp} />
          </div>
        </div>
        <div className="messages">
          {!hidden_chat &&
            (messages.length === 0x0 ? (
              <div className="wrap">There's no messages yet</div>
            ) : (
              messages.map(
                (message, index) =>
                  checkTypeMessage(message.tag) && (
                    <div className="message" key={index}>
                      <span className="time small-wrap">
                        {new Date(message.timestamp)
                          .toTimeString()
                          .slice(0x0, 0x5)}
                      </span>
                      <span className="sender small-wrap">
                        {message.username}
                      </span>
                      {message.verified ? (
                        <span className="verified small-wrap">verified</span>
                      ) : null}
                      <span className="message-text">{message.message}</span>
                    </div>
                  ),
              )
            ))}
        </div>
      </div>
    </div>
  );
};
