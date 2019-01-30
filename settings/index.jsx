function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Second Hand Color</Text>}>
        <ColorSelect
          settingsKey="color"
          colors={[
            {color: "tomato"},
            {color: "sandybrown"},
            {color: "#FFD700"},
            {color: "#ADFF2F"},
            {color: "deepskyblue"},
            {color: "plum"}
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">Second Hand Movement</Text>}>
        <Toggle
          settingsKey="toggle"
          label="Toggle sweep"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);