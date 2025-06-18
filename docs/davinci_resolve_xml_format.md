# DaVinci Resolve XML Script/Transcript Format Reference

## Key Conventions
- DaVinci Resolve expects Final Cut Pro XML (FCPXML) for timeline/script import.
- Scene, timestamp, and speaker labels should be structured as markers or comments in the XML.
- Text content should be wrapped in <text> or <note> tags, not just <Content>.
- Timestamps should be in HH:MM:SS:FF (frames) format if possible.
- Speaker/scene info can be included as attributes or separate elements.

## Example (FCPXML 1.9+)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p24" frameDuration="1/24s"/>
  </resources>
  <library>
    <event name="Script Import">
      <project name="Script">
        <sequence format="r1" duration="3600s">
          <spine>
            <gap duration="3600s">
              <title name="Scene 1" lane="1" offset="0s" duration="60s">
                <text>Speaker: John\n[00:00] In the beginning...</text>
              </title>
              <!-- More scenes/titles here -->
            </gap>
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
```

## Resources
- [FCPXML Spec](https://developer.apple.com/documentation/professional_video_applications/fcpxml)
- [DaVinci Resolve Import Docs](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_17_Reference_Manual.pdf)

## Notes
- For simple script import, a minimal FCPXML with <title> elements for each scene/section is sufficient.
- For advanced workflows, consider markers, roles, and metadata.
