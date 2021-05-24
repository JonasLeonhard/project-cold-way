import { useState } from 'react';
import StyledIndexForm from './indexForm.style';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button, Space, Input, Tooltip } from 'antd';

const IndexForm = ({ roomUuid }: { roomUuid: string }) => {
    const [ inputValue, setInputValue ] = useState('');
    const router = useRouter();

    const submitHandler = e => {
        e.preventDefault();
        router.push(`/room/${inputValue}`);
    };

    return (
        <StyledIndexForm>
            <Space direction="vertical">
                <Link href={`/room/${roomUuid}`}>
                    <a>
                        <Button type="dashed" block>Create Room</Button>
                    </a>
                </Link>
                <div className="indexForm__join-form" tabIndex={1}>
                    <form action="/room/join" method="GET" onSubmit={submitHandler}>
                        <Tooltip
                            trigger={['focus']}
                            title="Uuid of a Room to join"
                            placement="left"
                        >
                            <Input
                                placeholder="Input a Room Uuid"
                                className="indexForm__join-input"
                                name="uuid"
                                value={inputValue}
                                allowClear
                                onChange={e => {setInputValue(e.target.value)}}
                            />
                        </Tooltip>
                        <Button type="primary" block className="indexForm__join-button">Join Room</Button>
                    </form>
                </div>

            </Space>
        </StyledIndexForm>
    )
}

export default IndexForm