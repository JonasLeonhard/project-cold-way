import StyledFooter from './footer.style';

import Container from '../container/container';
import { Tooltip } from 'antd';
import { GithubOutlined, ContactsOutlined } from '@ant-design/icons';

const Footer = () => {
  return (
    <StyledFooter>
      <Container className="footer__inner">
        <div className="footer__links">
          <div className="footer__card">
            <div>
              <Tooltip
                trigger={['hover']}
                title="Github."
                placement="top"
              >
                <a target="_blank" href="https://github.com/jonasleonhard">
                  <GithubOutlined />
                </a>
              </Tooltip>
            </div>
          </div>

          <div className="footer__card">
            <div>
              <Tooltip
                trigger={['hover']}
                title="Contact."
                placement="top"
              >
                <a target="_blank" href="https://github.com/jonasleonhard">
                  <ContactsOutlined />
                </a>
              </Tooltip>
            </div>
          </div>

          <div className="footer__copyright">
            Copyright 2021 Jonas Leonhard, All rights reserved.
          </div>
        </div>
      </Container>
    </StyledFooter>
  )
}

export default Footer