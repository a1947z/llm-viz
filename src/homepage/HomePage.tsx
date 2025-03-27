'use client';
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCircleDollarToSlot, faEnvelope, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import s from './HomePage.module.scss';
import { Tooltip } from '../utils/Tooltip';

export const HomePage: React.FC = () => {
    let [emailText, setEmailText] = useState('');
    let router = useRouter();

    function externalIcon() {
        return <FontAwesomeIcon icon={faUpRightFromSquare} fontSize={10} className='ml-3 mr-1 relative top-[-1px]' />;
    }

    return <div className={s.homePage}>
        
        <div className={s.projectsSection}>
            <div className={s.sectionTitle}>LLM大语言模型可视化项目</div>
            <div className={s.projectCard} onClick={() => router.push('/llm')}>
                <div className={s.cardImageWrapper}>
                    <div className={s.cardImage}>
                        <img src="/images/llm-viz-screenshot2.png" alt="LLM Visualization Screenshot" />
                    </div>
                </div>
                <div className={s.cardContent}>
                    <div className={s.cardTitle}>
                        <Link href={"/llm"}>
                        {/* rel="noopener noreferrer" target="_blank"> */}
                            LLM可视化（LLM Visualization）
                        </Link>
                    </div>
                    <div className={s.cardText}>
                        作者：Brendan Bycroft。 
                        本项目来自： https://bbycroft.net/
                        对支撑 OpenAI 的 ChatGPT 的大语言模型（LLM）算法的可视化展示及操作演示。深入到每一次加法和乘法运算来探究该算法，切实见证整个大模型内部的运算过程。
                    </div>
                </div>
            </div>
        </div>

    </div>;
}
