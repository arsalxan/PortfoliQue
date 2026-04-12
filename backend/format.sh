#!/bin/bash
# Insert fmt-maven-plugin into pom.xml if it doesn't exist
if ! grep -q "fmt-maven-plugin" pom.xml; then
  sed -i '' '/<\/plugins>/i\
      <plugin>\
        <groupId>com.spotify.fmt</groupId>\
        <artifactId>fmt-maven-plugin</artifactId>\
        <version>2.24</version>\
        <executions>\
          <execution>\
            <goals>\
              <goal>format</goal>\
            </goals>\
          </execution>\
        </executions>\
      </plugin>' pom.xml
fi
