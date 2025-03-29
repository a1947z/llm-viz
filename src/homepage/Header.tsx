import React from "react";

export const Header: React.FC<{
    title?: React.ReactNode;
    children?: React.ReactNode; // 添加 children 属性
}> = ({ title, children }) => {
    return (
        <div
            style={{
                padding: "20px",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.6",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start" }}>
                {title && (
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#333",
                            marginRight: "20px",
                        }}
                    >
                        {title}
                    </div>
                )}
                <div>
                    <div style={{ fontSize: "14px", color: "#555" }}>
                        通过3D方式，了解ChatGPT/DeepSeek等大语言模型（LLM）内部数学原理和解析过程。
                    </div>
                    <div
                        style={{
                            fontSize: "10px",
                            color: "#555",
                            marginBottom: "5px",
                        }}
                    >
                        作者：
                        <span style={{ fontWeight: "bold" }}>
                            Brendan Bycroft（
                        </span>           
                         <a
                            href="https://bbycroft.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007BFF", textDecoration: "none" }}
                        >
                            https://bbycroft.net/
                        </a>
                        ）。本项目来自开源项目：
                         <a
                            href="https://github.com/bbycroft/llm-viz"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007BFF", textDecoration: "none" }}
                        >
                           llm-viz
                        </a>
                    </div>
                </div>
            </div>
            {children && <div>{children}</div>} {/* 渲染 children */}
        </div>
    );
};
