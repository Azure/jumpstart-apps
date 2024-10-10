import React from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
  tokens,
  Body1,
  Caption1
} from "@fluentui/react-components";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import Footer from '../../components/ShopperFooter';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";

const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      card: {
        display: "flex",
        width: "600px",
        height: "400px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
      },
      cardpreviewtext: {
          color: "var(--Text-Primary, #323130)",
          textAlign: "center",
          fontfeaturesettings: "'liga' off, 'clig' off",
          fontfamily: tokens.fontFamilyBase,
          fontsize: tokens.fontSizeHero800,
          fontstyle: "normal",
          fontweight: tokens.fontWeightRegular,
          lineHeight: tokens.lineHeightHero900
      },      
      cardfooter: {
        display: "flex",
        padding: "var(--card-Vertical, 12px) var(--card-Horizontal, 12px)",
        justifyContent: "center",
        alignItems: "center",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
      },
      cardfootercontent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
      },
      cardfootertitlecontenttext: {
        display: "flex",
        paddingBottom: "2px",
        alignItems: "flex-start",
        alignSelf: "stretch",
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-300, 14px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-300, 20px)",
      },
      cardfootersubtitlecontenttext: {
        overflow: "hidden",
        color: "NeutralForeground3.Rest",
        textOverflow: "ellipsis",

/* Web/Caption 1 */
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-200, 12px)",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "var(--Line-height-200, 16px)",
      }
    });

    const Shopper = () => {
        const styles = useStyles();
          return (
              <FluentProvider theme={webLightTheme}>
                <CopilotProvider mode='sidecar'>
                    <Stack>
                        <Header />
                        <TopNav />
                        <Stack id='MainContent'>
                            <Stack id='HeroContent' horizontal>
                            <Card className={styles.card}>
                    <CardHeader
                        image={        
                        <img
                          src={"ShopperHeroImage1.png"}
                          alt="Fridge Abc 123"
                        />}
                        description={<Caption1></Caption1>}
                    />
                    <CardFooter className={styles.cardfooter}>
                    <div className={styles.cardfootercontent}>
                      <Text className={styles.cardfootertitlecontenttext}>Now offering curbside pickup</Text>
                      <Text className={styles.cardfootersubtitlecontenttext}>Start your cart
                      </Text>                        
                    </div>
                    </CardFooter>
                </Card>
                <Card className={styles.card}>
                    <CardHeader
                        image={        
                          <img
                            src={"ShopperHeroImage2.png"}
                            alt="Fridge Abc 123"
                          />}
                        description={<Caption1></Caption1>}
                    />
                    <CardFooter className={styles.cardfooter}>  
                    <div className={styles.cardfootercontent}>
                      <Text className={styles.cardfootertitlecontenttext}>Let Cerebral handle your dinner recipes</Text>
                      <Text className={styles.cardfootersubtitlecontenttext}>Ask Genie</Text>                        
                    </div>
                    </CardFooter>
                </Card>                               
                            </Stack>
                            <Stack id='ExploreCategories'>
                                <Text>Explore Categories</Text>
                                <Stack horizontal id='Categories'>

                                </Stack>
                            </Stack>
                            <Stack id='CardsSection' horizontal>

                            </Stack>
                            <Footer />
                        </Stack>
                    </Stack>
                </CopilotProvider>
              </FluentProvider>
    );
  };
  
  export default Shopper;                
      